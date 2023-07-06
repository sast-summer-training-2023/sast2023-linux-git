use crate::query;
use crate::submit;

#[non_exhaustive]
pub struct DBWrapper {
    pub client: tokio::sync::RwLock<tokio_postgres::Client>,
    pub query_statement: tokio_postgres::Statement,
    pub submit_statement: tokio_postgres::Statement,
}

pub async fn init_db() -> DBWrapper {
    let mut config = tokio_postgres::Config::new();
    let (client, connection) = config
        .host_path("/tmp")
        .user("postgres")
        .dbname("postgres")
        .connect(tokio_postgres::NoTls)
        .await
        .expect("database connect error");

    tokio::spawn(async move { connection.await.expect("database connection finish error") });

    let query_statement = client.prepare(query::SQL).await.unwrap();
    let submit_statement = client.prepare(submit::SQL).await.unwrap();

    DBWrapper {
        client: tokio::sync::RwLock::new(client),
        query_statement,
        submit_statement,
    }
}
