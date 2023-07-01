use serde::{Deserialize, Serialize};
use tokio::sync::OnceCell;

#[derive(Deserialize, Serialize)]
pub struct FlagInfo {
    pub name: String,
    #[serde(skip_serializing)]
    pub flag: String,
    pub score: u32,
    pub category: String,
}

async fn init() -> Vec<FlagInfo> {
    serde_json::from_str(include_str!("../../flags.json")).unwrap()
}

static FLAGS: OnceCell<Vec<FlagInfo>> = OnceCell::const_new();

pub async fn get() -> &'static [FlagInfo] {
    FLAGS.get_or_init(init).await
}
