use std::ops::Deref;

use crate::{
    db::DBWrapper,
    flags::{self, FlagInfo},
};
use serde::Serialize;

#[derive(Serialize)]
pub struct ResultRow {
    pub id: u32,
    pub state: Vec<Option<u64>>,
}

#[derive(Serialize)]
pub struct QueryResult {
    pub time: u64,
    pub flags: &'static [FlagInfo],
    pub data: Vec<ResultRow>,
}

pub const SQL: &str = "select * from leaderboard order by id";

pub async fn query(db: &DBWrapper, time: u64) -> Result<QueryResult, String> {
    let guard = db.client.read().await;
    let client = guard.deref();

    let rows = match client.query(&db.query_statement, &[]).await {
        Err(e) => return Err(e.to_string()),
        Ok(r) => r,
    };

    fn mapper(row: tokio_postgres::Row) -> Option<ResultRow> {
        let id = row.try_get::<_, i32>(0).ok()? as u32;
        let state = row.try_get::<_, Vec<Option<i64>>>(1).ok()?;
        let (ptr, len, cap) = state.into_raw_parts();
        let mut state = unsafe { Vec::from_raw_parts(ptr as *mut Option<u64>, len, cap) };

        state.resize(flags::get().len(), None);

        Some(ResultRow { id, state })
    }

    Ok(QueryResult {
        time,
        flags: flags::get(),
        data: rows.into_iter().filter_map(mapper).collect(),
    })
}
