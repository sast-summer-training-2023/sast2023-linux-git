#![feature(let_chains)]
#![feature(try_blocks)]
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
 *       "name": "姓名",
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
use submit::{SubmitError, SubmitRequest, SubmitSuccess};

const BAD_JSON: &str = "\"Serialization Failed\"";

#[post("/query")]
async fn handle_query(db: web::Data<DBWrapper>) -> impl Responder {
    let time = util::time();

    let mut response = HttpResponse::Ok();
    response.content_type(mime::APPLICATION_JSON);

    let body = match query::query(db.get_ref(), time).await {
        Err(err) => {
            response.status(StatusCode::BAD_REQUEST);
            serde_json::to_string(&err)
        }
        Ok(succ) => serde_json::to_string(&succ),
    }
    .unwrap_or_else(|_| {
        response.status(StatusCode::INTERNAL_SERVER_ERROR);
        BAD_JSON.to_owned()
    });

    response.message_body(body)
}

#[post("/submit")]
async fn handle_submit(
    req: Result<web::Either<web::Json<SubmitRequest>, web::Form<SubmitRequest>>, ActixError>,
    db: web::Data<DBWrapper>,
) -> impl Responder {
    let time = util::time();

    let mut response = HttpResponse::Ok();
    response.content_type(mime::APPLICATION_JSON);

    let req_inner: SubmitRequest;
    let res: Result<SubmitSuccess, SubmitError> = 'r: {
        req_inner = match req {
            Err(err) => break 'r Err(SubmitError::RequestError(err.to_string())),
            Ok(either) => either,
        }
        .into_inner();

        submit::submit(db.get_ref(), &req_inner, time).await
    };

    let body = match res {
        Ok(succ) => serde_json::to_string(&succ),
        Err(err) => {
            response.status(err.get_status_code());
            serde_json::to_string(&err)
        }
    }
    .unwrap_or_else(|_| {
        response.status(StatusCode::INTERNAL_SERVER_ERROR);
        BAD_JSON.to_owned()
    });

    response.message_body(body)
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
