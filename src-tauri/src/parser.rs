use std::fs;
use std::path::Path;
pub mod tags;
use crate::parser::tags::analyze_repo;



extern "C" {
    fn tree_sitter_php() -> Language;
}

pub fn parse_project_files(path: &str) {
    let entries = fs::read_dir(path).unwrap();
    for entry in entries {
        let entry = entry.unwrap();
        let path = entry.path();
        if path.is_file() {
            if let Some(ext) = path.extension() {
                if ext == "php" {
                    analyze_repo(path.to_str().expect("Failed to convert PathBuf to &str"));
                    // Przetwarzaj plik
                    //parse_php_file(&path);
                }
            }
        } else if path.is_dir() {
            // Rekurencyjnie przetwarzaj podkatalogi
            parse_project_files(path.to_str().unwrap());
        }
    }
}


use tree_sitter::{Language, Parser, Node};
extern crate tree_sitter_php;

// Funkcja do wydobywania nazw z węzłów
fn get_node_field(node: Node, field: &str, code: &str) -> Option<String> {
    node.child_by_field_name(field)
        .and_then(|n| n.utf8_text(code.as_bytes()).ok())
        .map(|s| s.to_string())
}

// Funkcja do konwersji węzła Tree-sitter na bardziej szczegółowy opis
fn node_to_string(node: Node, code: &str, indent: usize) -> String {
    let node_type = node.kind();
    let indentation = "  ".repeat(indent);
    let mut result = String::new();

    // Pobierz nazwę, jeśli istnieje
    let name = get_node_field(node, "name", code);

    match node_type {
        // Przestrzeń nazw
        "namespace_definition" => {
            if let Some(namespace) = name {
                result.push_str(&format!("{}namespace {};\n", indentation, namespace));
            }
        }
        // Użycie przestrzeni nazw
        "namespace_use_declaration" => {
            let use_statement = code[node.byte_range()].trim();
            result.push_str(&format!("{}use {};\n", indentation, use_statement));
        }
        // Deklaracja klasy
        "class_declaration" => {
            if let Some(class_name) = name {
                result.push_str(&format!("{}class {} {{\n", indentation, class_name));
            }
        }
        // Atrybuty klasy
        "attribute_list" => {
            for i in 0..node.child_count() {
                let child = node.child(i).unwrap();
                if let Some(attr_name) = get_node_field(child, "name", code) {
                    result.push_str(&format!("{}#[{}]\n", indentation, attr_name));
                }
            }
        }
        // Deklaracja metody
        "method_declaration" => {
            let visibility = get_node_field(node, "visibility", code).unwrap_or("public".to_string());
            let is_static = node.child_by_field_name("static").is_some();
            let static_str = if is_static { "static " } else { "" };
            if let Some(method_name) = name {
                result.push_str(&format!(
                    "{}{}{}function {}(",
                    indentation, visibility, static_str, method_name
                ));

                // Przetwarzanie parametrów
                if let Some(params_node) = node.child_by_field_name("parameters") {
                    result.push_str(&format!("{}", extract_parameters(params_node, code)));
                }
                result.push_str(") {\n");
            }
        }
        // Konstruktor
        "constructor_declaration" => {
            result.push_str(&format!("{}public function __construct(", indentation));
            if let Some(params_node) = node.child_by_field_name("parameters") {
                result.push_str(&format!("{}", extract_parameters(params_node, code)));
            }
            result.push_str(") {\n");
        }
        // Parametry funkcji
        "formal_parameters" => {
            for i in 0..node.child_count() {
                let child = node.child(i).unwrap();
                result.push_str(&node_to_string(child, code, indent + 1));
            }
        }
        // Komentarze
        "comment" => {
            result.push_str(&format!("{}// {}\n", indentation, code[node.byte_range()].trim()));
        }
        _ => {
            result.push_str(&format!("{}{}\n", indentation, node_type));
        }
    }

    // Przetwarzanie dzieci węzła rekurencyjnie
    for i in 0..node.child_count() {
        let child = node.child(i).unwrap();
        result.push_str(&node_to_string(child, code, indent + 1));
    }

    if node_type == "class_declaration" || node_type == "method_declaration" {
        result.push_str(&format!("{}}}\n", indentation));
    }

    result
}

// Funkcja do przetwarzania parametrów funkcji
fn extract_parameters(params_node: Node, code: &str) -> String {
    let mut params = Vec::new();
    for i in 0..params_node.child_count() {
        let param = params_node.child(i).unwrap();
        if param.kind() == "property_promotion_parameter" || param.kind() == "simple_parameter" {
            let param_type = get_node_field(param, "type", code).unwrap_or_default();
            let param_name = get_node_field(param, "name", code).unwrap_or_default();
            params.push(format!("{} ${}", param_type, param_name));
        }
    }
    params.join(", ")
}

pub fn parse_php_file(file_path: &Path) {
    let code = fs::read_to_string(file_path).expect("Nie można odczytać pliku");
    let mut parser = Parser::new();
    let language = tree_sitter_php::language();
    parser.set_language(language).expect("Błąd przy ustawianiu języka");

    let tree = parser.parse(&code, None).expect("Błąd parsowania");
    let root_node = tree.root_node();

    let formatted_output = node_to_string(root_node, &code, 0);
    println!("{}", formatted_output);
}