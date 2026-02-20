use serde::Serialize;

#[derive(Serialize)]
pub struct ModelStatus {
    ready: bool,
    backend: String,
}

#[derive(Serialize)]
pub struct CsvRow {
    id: i64,
    unique_id: String,
    ds: String,
    y: f64,
}

#[derive(Serialize)]
pub struct ParseResult {
    rows: Vec<CsvRow>,
    series: Vec<String>,
}

#[tauri::command]
fn get_model_status() -> Result<ModelStatus, String> {
    let backend = if cfg!(target_os = "macos") {
        "metal".to_string()
    } else {
        "cpu".to_string()
    };

    Ok(ModelStatus {
        ready: true,
        backend,
    })
}

#[tauri::command]
fn parse_csv(content: String) -> Result<ParseResult, String> {
    let mut reader = csv::ReaderBuilder::new()
        .has_headers(true)
        .flexible(true)
        .trim(csv::Trim::All)
        .from_reader(content.as_bytes());

    let headers = reader
        .headers()
        .map_err(|e| format!("Failed to read CSV headers: {}", e))?
        .clone();

    let expected = ["id", "unique_id", "ds", "y"];
    for (i, exp) in expected.iter().enumerate() {
        let header = headers.get(i).unwrap_or("");
        if header != *exp {
            return Err(format!(
                "Invalid CSV format: expected column '{}' at position {}, found '{}'",
                exp,
                i + 1,
                header
            ));
        }
    }

    let mut rows = Vec::new();
    let mut series_set = std::collections::HashSet::new();

    for (line_idx, result) in reader.records().enumerate() {
        let record = result.map_err(|e| format!("Error at line {}: {}", line_idx + 2, e))?;

        let id: i64 = record
            .get(0)
            .unwrap_or("")
            .parse()
            .map_err(|_| format!("Invalid id at line {}", line_idx + 2))?;

        let unique_id = record.get(1).unwrap_or("").to_string();
        let ds = record.get(2).unwrap_or("").to_string();

        let y: f64 = record
            .get(3)
            .unwrap_or("")
            .parse()
            .map_err(|_| format!("Invalid y value at line {}", line_idx + 2))?;

        series_set.insert(unique_id.clone());
        rows.push(CsvRow { id, unique_id, ds, y });
    }

    let mut series: Vec<String> = series_set.into_iter().collect();
    series.sort();

    Ok(ParseResult { rows, series })
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_store::Builder::default().build())
        .invoke_handler(tauri::generate_handler![get_model_status, parse_csv])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
