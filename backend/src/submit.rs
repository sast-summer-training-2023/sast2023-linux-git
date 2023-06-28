use crate::{
    db::DBWrapper,
    flags::{self, FlagInfo},
};
use serde::{Deserialize, Serialize};
use std::ops::DerefMut;

#[derive(Deserialize)]
pub struct SubmitRequest {
    pub id: String,
    pub flag: String,
}
#[derive(Serialize)]
pub enum SubmitError<'a> {
    IdFormatError { id: &'a str },
    FlagFormatError { flag: &'a str },
    WrongFlag { raw_flag: &'a str },
    MemberNotFound { id: u32 },
    DatabaseError(String),
}

#[derive(Serialize)]
pub enum SubmitSuccess<'a> {
    Success {
        name: &'a str,
        flag: &'a str,
        score: u32,
        time: u64,
    },
    AlreadySubmitted {
        name: &'a str,
        flag: &'a str,
        score: u32,
        time: u64,
        submit_time: u64,
    },
}

pub const SQL: &str = "update leaderboard set state[$2] = $3 where id = $1 returning (select state[$2] from leaderboard where id = $1)";

pub async fn submit<'a>(
    db: &'a DBWrapper,
    id: &'a str,
    flag: &'a str,
    time: u64,
) -> Result<SubmitSuccess<'a>, SubmitError<'a>> {
    let id: u32 = 'get_id: {
        if id.len() == 10 && id.starts_with("20") && let Ok(id) = id.parse::<u32>() {
            break 'get_id id;
        }
        return Err(SubmitError::IdFormatError { id });
    };

    if !flag.starts_with("sast2023{") || !flag.ends_with('}') {
        return Err(SubmitError::FlagFormatError { flag });
    }
    // SAFETY: flag starts with "sast2023{" and end with '}'.
    let raw_flag: &str = unsafe { flag.get_unchecked(9..flag.len() - 1) };

    let all_flags: &[FlagInfo] = flags::get();
    // assume all_flags.len() is constant
    let entry: Option<(usize, &FlagInfo)> = all_flags
        .iter()
        .enumerate()
        .find(|(_, f)| -> bool { f.flag == raw_flag });

    let (ord, info) = match entry {
        Some(tuple) => tuple,
        _ => return Err(SubmitError::WrongFlag { raw_flag }),
    };

    let txn_result: Result<(), tokio_postgres::Error> = try {
        let mut guard = db.client.write().await;
        let client = guard.deref_mut();
        let txn = client.transaction().await?;

        let rows = txn
            .query(
                &db.submit_statement,
                &[&(id as i32), &(ord as i32), &(time as i64)],
            )
            .await?;

        let row = match rows.first() {
            None => return Err(SubmitError::MemberNotFound { id }),
            Some(row) => row,
        };

        if let Ok(t) = row.try_get::<_, i64>(0) {
            return Ok(SubmitSuccess::AlreadySubmitted {
                name: &info.name,
                flag: &info.flag,
                score: info.score,
                time,
                submit_time: t as u64,
            });
        }

        txn.commit().await?;
    };
    if let Err(e) = txn_result {
        return Err(SubmitError::DatabaseError(e.to_string()));
    }

    Ok(SubmitSuccess::Success {
        name: &info.name,
        flag: &info.flag,
        score: info.score,
        time,
    })
}
