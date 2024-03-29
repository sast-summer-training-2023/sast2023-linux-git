use std::ops::Deref;

use crate::{
    db::DBWrapper,
    flags::{self, FlagInfo},
};
use serde::Serialize;

#[derive(Serialize)]
pub struct ResultRow {
    #[serde(skip_serializing)]
    pub id: u32,
    pub name: String,
    pub state: Vec<Option<u64>>,
}

#[derive(Serialize)]
pub struct QueryResult {
    pub time: u64,
    pub flags: &'static [FlagInfo],
    pub data: Vec<ResultRow>,
}

pub const SQL: &str = "select id, name, state from leaderboard order by id";

pub async fn query(db: &DBWrapper, time: u64) -> Result<QueryResult, String> {
    let guard = db.client.read().await;
    let client = guard.deref();

    let rows = match client.query(&db.query_statement, &[]).await {
        Err(e) => return Err(e.to_string()),
        Ok(r) => r,
    };

    let flags = flags::get().await;
    let flags_len = flags.len();

    let mapper = |row: tokio_postgres::Row| -> Option<ResultRow> {
        let id = row.try_get::<_, i32>(0).ok()? as u32;
        let name = row.try_get::<_, String>(1).ok()?;
        let mut state: Vec<Option<u64>> = row
            .try_get::<_, Vec<Option<i64>>>(2)
            .ok()?
            .into_iter()
            .map(|opt| opt.map(|i| i as u64))
            .collect();

        state.resize(flags_len, None);

        Some(ResultRow { id, name, state })
    };

    Ok(QueryResult {
        time,
        flags,
        data: rows.into_iter().filter_map(mapper).collect(),
    })
}
