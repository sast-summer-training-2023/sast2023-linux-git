use std::time::SystemTime;

pub fn time() -> u64 {
    #[cfg(unix)]
    unsafe {
        std::mem::transmute_copy::<SystemTime, u64>(&SystemTime::now())
    }
    #[cfg(not(unix))]
    SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap()
        .as_secs()
}
