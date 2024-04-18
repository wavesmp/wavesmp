use anyhow::Result;
use log::info;

pub async fn get_sql_database() -> Result<()> {
    info!("creating mysql connection pool");
    let pool = MySqlPoolOptions::new()
        .max_connections(5)
        .connect("mysql://root:root@localhost/waves").await?;

    // Make a simple query to return the given parameter (use a question mark `?` instead of `$1` for MySQL/MariaDB)
    let row: (i64,) = sqlx::query_as("SELECT ?")
        .bind(150_i64)
        .fetch_one(&pool).await?;

    info!("got result from db={}", row.0);

    Ok(())
}
