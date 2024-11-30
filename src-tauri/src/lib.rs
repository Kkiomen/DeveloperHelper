// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
mod parser;
use parser::parse_project_files;

mod repo_mod;
use repo_mod::prepare_words_to_find_files;

use std::fs::File;
use std::io::{Read, Write};
use std::path::{Path, PathBuf};
use zip::write::FileOptions;
use zip::ZipWriter;
use base64::{engine::general_purpose, Engine as _};
use std::fs;

// Importujemy potrzebne elementy z biblioteki `ignore`
use ignore::{WalkBuilder, WalkState, DirEntry};

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn get_zip_file_base64(zip_file_path: String) -> Result<String, String> {
    let file_data = fs::read(zip_file_path).map_err(|e| e.to_string())?;
    let base64_data = general_purpose::STANDARD.encode(&file_data);
    Ok(base64_data)
}

#[tauri::command]
fn process_project_directory(path: String) -> Result<String, String> {
    let dir_path = Path::new(&path);
    if !dir_path.exists() {
        return Err("Podany katalog nie istnieje".to_string());
    }

    let archive_path = dir_path.with_extension("zip");
    let file = File::create(&archive_path).map_err(|e| e.to_string())?;
    let mut zip = ZipWriter::new(file);

    let options = FileOptions::default()
        .compression_method(zip::CompressionMethod::Deflated)
        .unix_permissions(0o755);

    // Używamy `WalkBuilder` z biblioteki `ignore` do przeszukiwania plików z uwzględnieniem `.gitignore`
    let mut builder = WalkBuilder::new(&dir_path);
    builder.git_ignore(true);
    builder.hidden(false);
    builder.add_custom_ignore_filename(".gitignore");

    let walk = builder.build();

    let base_path = dir_path.parent().unwrap_or_else(|| Path::new(""));

    for result in walk {
        match result {
            Ok(entry) => {
                let path = entry.path();
                if path.is_dir() {
                    continue;
                }

                // Obliczamy względną ścieżkę pliku względem katalogu bazowego
                let name = path.strip_prefix(base_path).unwrap();

                // Pomijamy samego `.gitignore`
                if name.ends_with(".gitignore") {
                    continue;
                }

                // Otwieramy plik i dodajemy go do archiwum
                let mut f = File::open(&path).map_err(|e| e.to_string())?;
                let mut buffer = Vec::new();
                f.read_to_end(&mut buffer).map_err(|e| e.to_string())?;

                zip.start_file(name.to_string_lossy(), options)
                    .map_err(|e| e.to_string())?;
                zip.write_all(&buffer).map_err(|e| e.to_string())?;
            }
            Err(err) => {
                eprintln!("Błąd podczas przetwarzania pliku: {}", err);
            }
        }
    }

    zip.finish().map_err(|e| e.to_string())?;

    println!("{}", archive_path.display());
    println!("{}", archive_path.to_string_lossy());



    let file_data = fs::read(archive_path.to_string_lossy().to_string()).map_err(|e| e.to_string())?;
    let base64_data = general_purpose::STANDARD.encode(&file_data);

    Ok(base64_data)
}

#[tauri::command]
fn get_files_by_user_message(message: String) {
    prepare_words_to_find_files(&message);
    println!("Odebrano ścieżkę katalogu: {}", message);
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            greet,
            process_project_directory,
            get_files_by_user_message,
            get_zip_file_base64
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
