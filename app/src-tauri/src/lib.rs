use serde::Serialize;

#[derive(Serialize)]
pub struct ModelStatus {
    ready: bool,
    backend: String,
}

#[tauri::command]
fn get_model_status() -> Result<ModelStatus, String> {
    Ok(ModelStatus {
        ready: true,
        backend: "cpu".to_string(),
    })
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_store::Builder::default().build())
        .invoke_handler(tauri::generate_handler![get_model_status])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
