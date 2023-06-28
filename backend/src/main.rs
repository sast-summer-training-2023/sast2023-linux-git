#![feature(lazy_cell)]
#![feature(let_chains)]
#![feature(try_blocks)]
#![feature(vec_into_raw_parts)]
/*
 * 提交格式：curl -d 'id=2022_stuid' -d 'flag=sast2023{flag}' http://<host>/submit
 * 后端查询：curl -XPOST http://<host>/query (忽略所有请求体)
 * 返回：{
 *   "time": 16timestamp,
 *   "flags": [
 *     {
 *       "name": "Hello",
 *       "score": 40,
 *       "category": "Type 1"
 *     },
 *     {
 *       "name": "World",
 *       "score": 60,
 *       "category": "Type 2"
 *     },
 *     ...
 *   ],
 *   "data": [
 *     {
 *       "id": 2022_stuid,
 *       "state": [ null, 16timestamp, ... ]
 *     },
 *     ...
 *   ]
 * ]
 */

mod db;
mod flags;
mod query;
mod submit;
mod util;

use crate::db::DBWrapper;
use actix_web::{
    http::StatusCode, post, web, App, Error as ActixError, HttpResponse, HttpServer, Responder,
};
use serde_json::json;
use submit::SubmitRequest;

const BAD_JSON: &str = "\"Serialization Failed\"";

#[post("/query")]
async fn handle_query(db: web::Data<DBWrapper>) -> impl Responder {
    let time = util::time();

    let mut response = HttpResponse::Ok();
    response.content_type(mime::APPLICATION_JSON);

    let res = match query::query(db.get_ref(), time).await {
        Err(err) => {
            response.status(StatusCode::BAD_REQUEST);
            serde_json::to_string(&err)
        }
        Ok(succ) => serde_json::to_string(&succ),
    }
    .unwrap_or_else(|_| {
        response.status(StatusCode::BAD_REQUEST);
        BAD_JSON.to_owned()
    });

    response.message_body(res)
}

#[post("/submit")]
async fn handle_submit(
    req: Result<web::Either<web::Json<SubmitRequest>, web::Form<SubmitRequest>>, ActixError>,
    db: web::Data<DBWrapper>,
) -> impl Responder {
    let time = util::time();

    let mut response = HttpResponse::Ok();
    response.content_type(mime::APPLICATION_JSON);

    let res: String = 'r: {
        let req: SubmitRequest = match req {
            Err(err) => {
                response.status(StatusCode::BAD_REQUEST);
                break 'r json!({"RequestError": err.to_string()}).to_string();
            }
            Ok(either) => either,
        }
        .into_inner();

        match submit::submit(db.get_ref(), &req.id, &req.flag, time).await {
            Err(err) => {
                response.status(StatusCode::BAD_REQUEST);
                serde_json::to_string(&err)
            }
            Ok(succ) => serde_json::to_string(&succ),
        }
        .unwrap_or_else(|_| {
            response.status(StatusCode::BAD_REQUEST);
            BAD_JSON.to_owned()
        })
    };

    response.message_body(res)
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    let db = web::Data::new(db::init_db().await);

    let server = HttpServer::new(move || {
        App::new()
            .app_data(db.clone())
            .service(handle_query)
            .service(handle_submit)
    });
    server.bind_uds("backend.sock")?.run().await
}
