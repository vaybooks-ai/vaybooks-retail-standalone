use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct SystemInfo {
    pub os: String,
    pub arch: String,
    pub version: String,
}

#[tauri::command]
pub fn greet(name: &str) -> String {
    format!("Hello, {}! Welcome to VayBooks Retail.", name)
}

#[tauri::command]
pub fn get_system_info() -> SystemInfo {
    SystemInfo {
        os: std::env::consts::OS.to_string(),
        arch: std::env::consts::ARCH.to_string(),
        version: env!("CARGO_PKG_VERSION").to_string(),
    }
}

#[tauri::command]
pub async fn check_backend_status() -> Result<bool, String> {
    // TODO: Check if backend server is running
    // For now, return true
    Ok(true)
}

#[tauri::command]
pub fn get_app_data_dir(app_handle: tauri::AppHandle) -> Result<String, String> {
    match app_handle.path_resolver().app_data_dir() {
        Some(path) => Ok(path.to_string_lossy().to_string()),
        None => Err("Could not resolve app data directory".to_string()),
    }
}
