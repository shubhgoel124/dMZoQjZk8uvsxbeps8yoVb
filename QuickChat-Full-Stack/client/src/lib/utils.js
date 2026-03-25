export function formatMessageTime(date) {
  let d = new Date(date)
    return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false })
}