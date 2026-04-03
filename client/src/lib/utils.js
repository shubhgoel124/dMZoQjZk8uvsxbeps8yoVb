export function formatMessageTime(date) {
  let d = new Date(date)
    return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false })
}

export function formatLastSeen(date) {
    if (!date) return "Unknown"
    let d = new Date(date)
    const now = new Date()
    const diff = now - d
    const mins = Math.floor(diff / 60000)
    
    if (mins < 1) return "Just now"
    if (mins < 60) return `${mins} mins ago`
    
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours} hours ago`
    
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", hour12: true })
}

export function isSameDay(d1, d2) {
    if (!d1 || !d2) return false;
    let date1 = new Date(d1);
    let date2 = new Date(d2);
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
}

export function formatDateGroup(date) {
    if (!date) return "";
    let d = new Date(date);
    let now = new Date();
    
    let dTime = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    let nowTime = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    
    let diffDays = Math.floor((nowTime - dTime) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    
    if (diffDays < 7) {
        return d.toLocaleDateString("en-US", { weekday: 'long' });
    }
    
    return d.toLocaleDateString("en-GB");
}