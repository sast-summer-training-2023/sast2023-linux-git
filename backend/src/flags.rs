use serde::{Deserialize, Serialize};
use std::cell::LazyCell;

#[derive(Deserialize, Serialize)]
pub struct FlagInfo {
    pub name: String,
    #[serde(skip_serializing)]
    pub flag: String,
    pub score: u32,
    pub category: String,
}

fn init() -> Vec<FlagInfo> {
    serde_json::from_str(include_str!("../../flags.json")).unwrap()
}

static mut FLAGS: LazyCell<Vec<FlagInfo>> = LazyCell::new(init);

pub fn get() -> &'static [FlagInfo] {
    unsafe { &FLAGS }
}
