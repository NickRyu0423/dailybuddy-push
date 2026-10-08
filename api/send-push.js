const webpush = require('web-push');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = "https://jzpmvojogqouwjwmxtmz.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp6cG12b2pvZ3FvdXdqd214dG16Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MDg1MjcwMiwiZXhwIjoyMTA2NDI4NzAyfQ.S3s0BK2WOMxUo5U4AUpDDRLuv6Wq3oFcyQajIl3b1kE";
const VAPID_PUBLIC_KEY = "BOkquNCkgqXUwWojEDf8uUDKA7MbQtas5BytvOHi5QFnpcvWPZhM0ZdlJ9cMt8Rk6UcS1rFLJypffHcmZZzPzcM";
const VAPID_PRIVATE_KEY = "MeJctv3RxsKf7OHnm4JIOxyVrYPKS6xBo9-QJyciZrE";

webpush.setVapidDetails(
  'mailto:support@dailybuddy.app',
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  const { type, table, record } = req.body;

  try {
    // 1. 매일 아침 매칭 완료 알림 (matches 테이블에 INSERT 될 때)
    if (type === 'INSERT' && (table === 'matches' || (record && record.user1_id && record.user2_id))) {
      await sendToUser(record.user1_id, "Daily Buddy", "Your daily buddy has arrived! Start chatting now ☕");
      await sendToUser(record.user2_id, "Daily Buddy", "Your daily buddy has arrived! Start chatting now ☕");
    }

    // 2. 실시간 새 채팅 알림 (messages 테이블에 INSERT 될 때)
    if (type === 'INSERT' && (table === 'messages' || (record && record.match_id && record.sender_id))) {
      const { data: match } = await supabase.from('matches').select('user1_id, user2_id').eq('id', record.match_id).single();
      if (match) {
        // 메시지 보낸 상대방에게 발송
        const receiverId = (match.user1_id === record.sender_id) ? match.user2_id : match.user1_id;
        await sendToUser(receiverId, "Daily Buddy", "You have a new message from your buddy! 💬");
      }
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return res.status(500).json({ error: error.message });
  }
};

async function sendToUser(userId, title, body) {
  const { data: user } = await supabase.from('users').select('push_token').eq('id', userId).single();
  if (user && user.push_token) {
    try {
      await webpush.sendNotification(user.push_token, JSON.stringify({
        title,
        body,
        url: 'https://daily-buddy.glideos.app'
      }));
    } catch (e) {
      console.error(`Push notification failed for User ID ${userId}:`, e);
    }
  }
}
