require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const db = require('./database');

const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
db.exec(schema);

db.prepare('DELETE FROM ideas WHERE user_id IN (SELECT id FROM users WHERE email = ?)').run('demo@kiara.com');
db.prepare('DELETE FROM posts WHERE user_id IN (SELECT id FROM users WHERE email = ?)').run('demo@kiara.com');
db.prepare('DELETE FROM users WHERE email = ?').run('demo@kiara.com');

const hashedPassword = bcrypt.hashSync('demo1234', 10);
const userResult = db.prepare(
  'INSERT INTO users (name, email, password, brand_name, industry) VALUES (?, ?, ?, ?, ?)'
).run('Kiara', 'demo@kiara.com', hashedPassword, 'Kiara Studio', 'Fashion & Lifestyle');

const userId = userResult.lastInsertRowid;

const posts = [
  {
    title: 'Bo suu tap he 2026',
    caption: 'Kham pha nhung gam mau ruc ro cua mua he nay cung Kiara Studio',
    content_type: 'image', platform: 'instagram', status: 'published',
    scheduled_at: '2026-05-01 09:00:00', published_at: '2026-05-01 09:00:00',
    hashtags: '#fashion #summer2026 #kiarastudio',
    notes: 'Anh chup tai studio, anh sang tu nhien'
  },
  {
    title: 'Video GRWM buoi sang',
    caption: 'Get Ready With Me - Routine buoi sang cua minh trong 60 giay!',
    content_type: 'video', platform: 'tiktok', status: 'published',
    scheduled_at: '2026-05-02 08:00:00', published_at: '2026-05-02 08:00:00',
    hashtags: '#grwm #morningroutine #lifestyle',
    notes: 'Video quay vertical 9:16'
  },
  {
    title: 'Top 5 xu huong thoi trang thang 5',
    caption: '5 xu huong ban khong the bo lo thang nay',
    content_type: 'carousel', platform: 'facebook', status: 'published',
    scheduled_at: '2026-05-03 12:00:00', published_at: '2026-05-03 12:00:00',
    hashtags: '#trendingfashion #style2026',
    notes: '5 slide, moi slide 1 xu huong'
  },
  {
    title: 'Haul do vintage thang 4',
    caption: 'Minh da tim duoc nhung mon do vintage cuc xin nay!',
    content_type: 'video', platform: 'youtube', status: 'published',
    scheduled_at: '2026-05-04 18:00:00', published_at: '2026-05-04 18:00:00',
    hashtags: '#vintage #haul #thrifting',
    notes: 'Video dai 10-15 phut, can edit ky'
  },
  {
    title: 'Mini lookbook thang 5',
    caption: 'Outfit inspo cho ca tuan dau thang 5!',
    content_type: 'image', platform: 'threads', status: 'published',
    scheduled_at: '2026-05-05 10:00:00', published_at: '2026-05-05 10:00:00',
    hashtags: '#lookbook #ootd #kiarastudio',
    notes: null
  },
  {
    title: 'Reel mix outfit cong so',
    caption: 'Cong so ma van stylish - bi quyet cua minh day!',
    content_type: 'reel', platform: 'instagram', status: 'published',
    scheduled_at: '2026-05-06 07:00:00', published_at: '2026-05-06 07:00:00',
    hashtags: '#officestyle #worklook #fashion',
    notes: 'Reel 30 giay, nhac trending'
  },
  {
    title: 'Behind the scenes buoi chup hinh',
    caption: 'Hau truong buoi chup anh mua he - chaotic nhung vui!',
    content_type: 'story', platform: 'tiktok', status: 'scheduled',
    scheduled_at: '2026-05-08 15:00:00', published_at: null,
    hashtags: '#bts #photoshoot #kiarastudio',
    notes: 'Story series 5-7 phan'
  },
  {
    title: 'Review phu kien hot nhat thang 5',
    caption: 'Minh da thu 10 phu kien trending va day la ket qua',
    content_type: 'image', platform: 'facebook', status: 'scheduled',
    scheduled_at: '2026-05-10 11:00:00', published_at: null,
    hashtags: '#accessories #review #trending',
    notes: 'Can chup anh flatlay dep'
  },
  {
    title: 'Summer color palette 2026',
    caption: 'Nhung gam mau chu dao ban nen dien mua he nay',
    content_type: 'carousel', platform: 'instagram', status: 'scheduled',
    scheduled_at: '2026-05-12 09:30:00', published_at: null,
    hashtags: '#colorpalette #summervibes #fashionguide',
    notes: '6 slide mau sac, thiet ke dep'
  },
  {
    title: 'Vlog di mua sam cho Ben Thanh',
    caption: 'Thu thach tim outfit ca ngay duoi 500k!',
    content_type: 'video', platform: 'youtube', status: 'draft',
    scheduled_at: '2026-05-15 20:00:00', published_at: null,
    hashtags: '#vlog #shopping #budget',
    notes: 'Can len kich ban truoc khi quay'
  },
  {
    title: 'Tips phoi do dao pho',
    caption: '7 tips phoi do giup ban luon trong stylish du mac don gian',
    content_type: 'image', platform: 'threads', status: 'draft',
    scheduled_at: '2026-05-17 08:00:00', published_at: null,
    hashtags: '#styletips #ootd #fashionadvice',
    notes: null
  },
  {
    title: 'Reel transition outfit',
    caption: 'Mot chiec ao - 5 cach phoi khac nhau',
    content_type: 'reel', platform: 'instagram', status: 'draft',
    scheduled_at: '2026-05-19 12:00:00', published_at: null,
    hashtags: '#transition #reel #outfitideas',
    notes: 'Transition muot, can tap luyen truoc'
  },
  {
    title: 'Thu challenge thoi trang TikTok',
    caption: 'Tham gia challenge thoi trang hot nhat tuan nay!',
    content_type: 'video', platform: 'tiktok', status: 'idea',
    scheduled_at: '2026-05-22 18:00:00', published_at: null,
    hashtags: '#challenge #tiktokfashion #viral',
    notes: 'Xem trend truoc khi lam'
  },
  {
    title: 'Lookbook dam he duoi 400k',
    caption: 'Chung minh an mac dep khong can phai ton nhieu tien!',
    content_type: 'carousel', platform: 'facebook', status: 'idea',
    scheduled_at: '2026-05-25 10:00:00', published_at: null,
    hashtags: '#budgetfashion #dress #summerlook',
    notes: 'Tim cac mau dam gia re truoc'
  },
  {
    title: 'End of May Recap',
    caption: 'Thang 5 da qua nhung gi, minh cung nhin lai nhe!',
    content_type: 'image', platform: 'instagram', status: 'idea',
    scheduled_at: '2026-05-28 19:00:00', published_at: null,
    hashtags: '#monthlyrecap #kiarastudio #may2026',
    notes: 'Tong hop highlight thang 5'
  }
];

const insertPost = db.prepare(
  `INSERT INTO posts (user_id, title, caption, content_type, platform, status, scheduled_at, published_at, hashtags, notes)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
);

db.transaction(() => {
  for (const p of posts) {
    insertPost.run(userId, p.title, p.caption, p.content_type, p.platform, p.status, p.scheduled_at, p.published_at, p.hashtags, p.notes);
  }
})();

const ideas = [
  {
    title: 'Series "Hoc cach mac dep cung Kiara"',
    description: 'Series 5 tap huong dan phoi do tu co ban den nang cao danh cho nguoi moi bat dau quan tam den thoi trang',
    content_type: 'video', platforms: ['youtube', 'tiktok'], mood: 'educational',
    tags: ['series', 'tutorial', 'fashion101'], is_favorite: 1
  },
  {
    title: 'React Challenge - 24h chi mac 1 mau',
    description: 'Thu thach chi mac mot mau duy nhat trong 24h va ghi lai phan ung cua moi nguoi xung quanh',
    content_type: 'video', platforms: ['tiktok', 'instagram'], mood: 'entertaining',
    tags: ['challenge', '24h', 'fun'], is_favorite: 1
  },
  {
    title: 'Flash Sale Alert - Kiara Summer Collection',
    description: 'Thong bao flash sale bo suu tap he voi giam gia 30% chi trong 24h, tao cam giac urgency',
    content_type: 'story', platforms: ['instagram', 'facebook'], mood: 'promotional',
    tags: ['sale', 'flashsale', 'summer'], is_favorite: 0
  },
  {
    title: 'Cau chuyen ve lan dau tien dam mac bold outfit',
    description: 'Chia se hanh trinh vuot qua su tu ti de dam the hien phong cach ca nhan, truyen cam hung cho followers',
    content_type: 'reel', platforms: ['instagram', 'tiktok'], mood: 'inspirational',
    tags: ['story', 'confidence', 'selflove'], is_favorite: 1
  },
  {
    title: 'Trend Du doan: Phong cach Quiet Luxury co len ngoi?',
    description: 'Phan tich xu huong quiet luxury va du doan lieu no co phu hop voi thi truong thoi trang Viet Nam khong',
    content_type: 'carousel', platforms: ['instagram', 'threads'], mood: 'trending',
    tags: ['quietluxury', 'trend', 'analysis'], is_favorite: 0
  },
  {
    title: 'Giai thich cac quy tac phoi mau co ban',
    description: 'Infographic dang carousel giai thich color wheel, complementary colors va cach ap dung vao outfit hang ngay',
    content_type: 'carousel', platforms: ['instagram', 'facebook'], mood: 'educational',
    tags: ['colortheory', 'styling', 'beginner'], is_favorite: 0
  },
  {
    title: 'Swipe de thay transformation phong thu do thuc te',
    description: 'Truoc va sau khi vao phong thu do - nhung outfit tuong xau ma lai dep bat ngo khi mac that',
    content_type: 'carousel', platforms: ['instagram'], mood: 'entertaining',
    tags: ['transformation', 'tryingon', 'surprise'], is_favorite: 0
  },
  {
    title: 'Kiara Studio Membership - Exclusive Benefits',
    description: 'Gioi thieu chuong trinh membership moi voi cac quyen loi dac biet cho thanh vien than thiet',
    content_type: 'video', platforms: ['instagram', 'facebook', 'youtube'], mood: 'promotional',
    tags: ['membership', 'exclusive', 'kiara'], is_favorite: 0
  },
  {
    title: 'Thu gui phien ban 5 nam truoc cua minh',
    description: 'Chia se buc thu cam xuc ve hanh trinh xay dung phong cach ca nhan, nhung bai hoc tu nhung lan mac that bai',
    content_type: 'video', platforms: ['youtube', 'tiktok'], mood: 'inspirational',
    tags: ['letter', 'journey', 'growth'], is_favorite: 1
  },
  {
    title: 'Duet voi fashion creators ve trend hot nhat 2026',
    description: 'Tao loat video duet/collab voi cac creators thoi trang khac de cung binh luan ve cac trend hot nhat nam nay',
    content_type: 'video', platforms: ['tiktok'], mood: 'trending',
    tags: ['collab', 'duet', 'trend2026'], is_favorite: 0
  }
];

const insertIdea = db.prepare(
  `INSERT INTO ideas (user_id, title, description, content_type, platforms, mood, tags, is_favorite)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
);

db.transaction(() => {
  for (const idea of ideas) {
    insertIdea.run(
      userId, idea.title, idea.description, idea.content_type,
      JSON.stringify(idea.platforms), idea.mood,
      JSON.stringify(idea.tags), idea.is_favorite
    );
  }
})();

console.log('Seed data created successfully!');
console.log('  Demo user : demo@kiara.com / demo1234');
console.log(`  Posts     : ${posts.length} bai dang`);
console.log(`  Ideas     : ${ideas.length} y tuong`);
