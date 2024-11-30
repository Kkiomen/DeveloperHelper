use crate::parser::tags::analyze_repo as other_analyze_repo;
use petgraph::algo::page_rank;
use petgraph::graph::DiGraph;
use serde::{Deserialize, Serialize};
use sled::{Db, IVec};
use std::collections::{HashMap, HashSet};
use std::error::Error;
use std::fs;
use std::path::Path;
use tree_sitter::{Language, Node, Parser, Query, QueryCursor};
use tree_sitter_php::language as php_language;
use walkdir::WalkDir;

#[derive(Debug, Clone, Serialize, Deserialize)]
struct Tag {
    fname: String,
    line: usize,
    kind: String,
    name: String,
}

fn get_language() -> Language {
    php_language()
}

fn read_file_content(file_path: &str) -> Option<String> {
    fs::read_to_string(file_path).ok()
}

fn get_tags_from_file(file_path: &str) -> Result<Vec<Tag>, Box<dyn Error>> {
    // Odczytujemy zawartość pliku jako Vec<u8>
    let content = fs::read(file_path).expect("Nie można odczytać pliku");
    let code = String::from_utf8_lossy(&content);
    let code_bytes = code.as_bytes();

    // Inicjalizacja parsera
    let mut parser = Parser::new();
    let language = php_language();
    parser
        .set_language(language)
        .expect("Błąd przy ustawianiu języka");

    // Parsowanie kodu
    let tree = parser.parse(code_bytes, None).expect("Błąd parsowania");
    let root_node = tree.root_node();

    // Wczytanie zapytania `.scm`
    let query_scm_path = "src/parser/queries/tree-sitter-php-tags.scm";
    let query_scm = fs::read_to_string(query_scm_path)?;
    let query = Query::new(language, &query_scm)?;

    // Inicjalizacja wektora do przechowywania tagów
    let mut tags = Vec::new();

    // Użycie `QueryCursor` do dopasowania zapytania na drzewie składniowym
    let mut query_cursor = QueryCursor::new();
    for m in query_cursor.matches(&query, root_node, code_bytes) {
        for capture in m.captures {
            let node = capture.node;
            let tag_name = &query.capture_names()[capture.index as usize];

            // Określenie rodzaju tagu na podstawie jego nazwy
            let kind = if tag_name.contains("definition") {
                "def"
            } else if tag_name.contains("reference") {
                "ref"
            } else {
                continue;
            };

            // Pobranie tylko nazwy identyfikatora, jeśli dostępne jest pole `name`
            let name = if let Some(name_node) = node.child_by_field_name("name") {
                name_node.utf8_text(code_bytes).unwrap_or("").to_string()
            } else {
                // Jeśli nie ma pola `name`, sprawdźmy, czy to węzeł z inną referencją lub zignorujmy go
                if kind == "ref" {
                    node.utf8_text(code_bytes).unwrap_or("").to_string()
                } else {
                    continue; // Pomijamy węzły `def`, które nie mają `name`
                }
            };

            // Pobranie numeru linii
            let line = node.start_position().row + 1;

            // Dodanie tagu do listy
            tags.push(Tag {
                fname: file_path.to_string(),
                line,
                kind: kind.to_string(),
                name,
            });
        }
    }

    Ok(tags)
}
/// Funkcja rekurencyjna do znajdowania definicji funkcji
fn find_tags(node: Node, code_bytes: &[u8], tags: &mut Vec<Tag>, file_path: &str) {
    let mut cursor = node.walk();

    for child in node.children(&mut cursor) {
        let kind = child.kind();

        match kind {
            // Szukamy definicji funkcji
            "function_definition" => {
                if let Some(name_node) = child.child_by_field_name("name") {
                    let line = name_node.start_position().row + 1;
                    let name = name_node.utf8_text(code_bytes).unwrap_or("").to_string();
                    tags.push(Tag {
                        fname: file_path.to_string(),
                        line,
                        kind: "function".to_string(),
                        name,
                    });
                }
            }
            // Szukamy definicji klas
            "class_declaration" => {
                if let Some(name_node) = child.child_by_field_name("name") {
                    let line = name_node.start_position().row + 1;
                    let name = name_node.utf8_text(code_bytes).unwrap_or("").to_string();
                    tags.push(Tag {
                        fname: file_path.to_string(),
                        line,
                        kind: "class".to_string(),
                        name,
                    });
                }
            }
            // Szukamy referencji do zmiennych
            "variable_name" | "property_access_expression" => {
                let name = child.utf8_text(code_bytes).unwrap_or("").to_string();
                let line = child.start_position().row + 1;
                tags.push(Tag {
                    fname: file_path.to_string(),
                    line,
                    kind: "reference".to_string(),
                    name,
                });
            }
            _ => {}
        }

        // Rekurencyjnie przeszukujemy dzieci
        find_tags(child, code_bytes, tags, file_path);
    }
}

fn cache_tags(db: &Db, file_path: &str, tags: &[Tag]) {
    let key = file_path.as_bytes();
    let serialized_tags = serde_json::to_vec(tags).unwrap();
    db.insert(key, serialized_tags)
        .expect("Failed to cache tags");
}

fn load_cached_tags(db: &Db, file_path: &str) -> Option<Vec<Tag>> {
    let key = file_path.as_bytes();
    match db.get(key) {
        Ok(Some(data)) => {
            let tags: Vec<Tag> = serde_json::from_slice(&data).unwrap();
            Some(tags)
        }
        _ => None,
    }
}

pub fn analyze_repo(repo_path: &str) {
    let db = sled::open("tags_cache").expect("Failed to open cache");
    let mut all_tags: Vec<Tag> = Vec::new();
    let mut defines: HashMap<String, HashSet<String>> = HashMap::new();
    let mut references: HashMap<String, Vec<String>> = HashMap::new();

    for entry in WalkDir::new(repo_path).into_iter().filter_map(Result::ok) {
        let path = entry.path();
        if path.is_file() && path.extension().and_then(|s| s.to_str()) == Some("php") {
            let file_path = path.to_str().unwrap();
            let tags = get_tags_from_file(file_path);
            for tag in &tags {
                println!("{:?}", tag); // Debug print of each tag
            }
            // Ładowanie tagów z cache lub analiza pliku
            // let tags = if let Some(cached_tags) = load_cached_tags(&db, file_path) {
            //     cached_tags
            // } else {
            //     let tags = get_tags_from_file(file_path);
            //     cache_tags(&db, file_path, &tags);
            //     tags
            // };

            // for tag in &tags {
            //     if tag.kind == "def" {
            //         defines.entry(tag.name.clone()).or_default().insert(tag.fname.clone());
            //     } else if tag.kind == "ref" {
            //         references.entry(tag.name.clone()).or_default().push(tag.fname.clone());
            //     }
            // }
            // all_tags.extend(tags);
        }
    }

    // Tworzenie grafu zależności
    let mut graph = DiGraph::new();
    let mut node_indices = HashMap::new();

    for (name, files) in &defines {
        for file in files {
            let idx = *node_indices
                .entry(file.clone())
                .or_insert_with(|| graph.add_node(file.clone()));
            if let Some(ref_files) = references.get(name) {
                for ref_file in ref_files {
                    let ref_idx = *node_indices
                        .entry(ref_file.clone())
                        .or_insert_with(|| graph.add_node(ref_file.clone()));
                    graph.add_edge(idx, ref_idx, 1.0);
                }
            }
        }
    }

    // Obliczanie PageRank
    //     let ranks = page_rank(&graph, 0.85, None, 100, 1e-6).unwrap();
    //     for (idx, rank) in ranks.iter().enumerate() {
    //         let file = graph.node_weight(idx).unwrap();
    //         println!("File: {}, Rank: {:.4}", file, rank);
    //     }
}

fn get_scm_content() -> String {
    let code = "(class_declaration
  name: (name) @name.definition.class) @definition.class

(function_definition
  name: (name) @name.definition.function) @definition.function

(method_declaration
  name: (name) @name.definition.function) @definition.function

(object_creation_expression
  [
    (qualified_name (name) @name.reference.class)
    (variable_name (name) @name.reference.class)
  ]) @reference.class

(function_call_expression
  function: [
    (qualified_name (name) @name.reference.call)
    (variable_name (name)) @name.reference.call
  ]) @reference.call

(scoped_call_expression
  name: (name) @name.reference.call) @reference.call

(member_call_expression
  name: (name) @name.reference.call) @reference.call";
    code.to_string()
}
