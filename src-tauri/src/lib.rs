// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
mod parser;
use parser::parse_project_files;

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}


#[tauri::command]
fn process_project_directory(path: String) {
    println!("Odebrano ścieżkę katalogu: {}", path);

    // Przykładowa logika przetwarzania katalogu
    // Możesz tu dodać funkcję do przeszukiwania katalogu lub przetwarzania plików
    if std::path::Path::new(&path).exists() {

        parse_project_files(&path);
        println!("Katalog istnieje i jest gotowy do przetwarzania");
    } else {
        println!("Podany katalog nie istnieje");
    }
}



#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![greet, process_project_directory])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");


}




