'use strict';
/**
 * generate-june-excel.js
 * Tạo file Excel đẹp cho chiến dịch tháng 6 Kiara Planner
 * Sheet 1: Tổng quan chiến dịch
 * Sheet 2: Captions + Hashtags (content-creator agent)
 * Sheet 3: Trend Analysis + Performance Report (data-analyst agent)
 */

const ExcelJS = require('exceljs');
const path    = require('path');

// ── Màu sắc ──────────────────────────────────────────────────────────────────
const PINK       = 'FFFFB6C1';  // header fill
const PINK_DARK  = 'FFFF69B4';  // sub-header / accent
const PURPLE     = 'FFE6D0FF';  // alternate row
const WHITE      = 'FFFFFFFF';
const FONT_DARK  = 'FF2D1B4E';  // dark purple text
const FONT_WHITE = 'FFFFFFFF';

// ── Helper: style header cell ─────────────────────────────────────────────────
function headerCell(cell, value, opts = {}) {
  cell.value = value;
  cell.font  = { bold: true, color: { argb: FONT_WHITE }, size: opts.size || 11, name: 'Calibri' };
  cell.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: opts.color || PINK_DARK } };
  cell.alignment = { vertical: 'middle', horizontal: opts.align || 'center', wrapText: true };
  cell.border = {
    top: { style: 'thin' }, bottom: { style: 'thin' },
    left: { style: 'thin' }, right: { style: 'thin' },
  };
}

function dataCell(cell, value, opts = {}) {
  cell.value = value;
  cell.font  = { size: opts.size || 10, name: 'Calibri', bold: opts.bold || false, color: { argb: opts.color || FONT_DARK } };
  cell.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: opts.fill || WHITE } };
  cell.alignment = { vertical: 'middle', horizontal: opts.align || 'left', wrapText: true };
  cell.border = {
    top: { style: 'hair' }, bottom: { style: 'hair' },
    left: { style: 'hair' }, right: { style: 'hair' },
  };
}

function titleCell(ws, rowNum, colSpan, text, fillColor) {
  ws.mergeCells(rowNum, 1, rowNum, colSpan);
  const cell = ws.getCell(rowNum, 1);
  cell.value = text;
  cell.font  = { bold: true, size: 14, color: { argb: FONT_WHITE }, name: 'Calibri' };
  cell.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: fillColor || PINK_DARK } };
  cell.alignment = { vertical: 'middle', horizontal: 'center' };
  ws.getRow(rowNum).height = 30;
}

function blankRow(ws) {
  ws.addRow([]);
}

// ════════════════════════════════════════════════════════════════════════════
// SHEET 1 — Tổng quan chiến dịch tháng 6
// ════════════════════════════════════════════════════════════════════════════
function buildSheet1(wb) {
  const ws = wb.addWorksheet('📋 Tổng quan chiến dịch');
  ws.properties.tabColor = { argb: PINK_DARK };

  ws.columns = [
    { key: 'a', width: 28 },
    { key: 'b', width: 42 },
    { key: 'c', width: 20 },
    { key: 'd', width: 20 },
  ];

  // Title
  titleCell(ws, 1, 4, '🌸 KIARA PLANNER — CHIẾN DỊCH MARKETING THÁNG 6 / 2026', PINK_DARK);

  // Generated info
  ws.mergeCells(2, 1, 2, 4);
  const info = ws.getCell(2, 1);
  info.value = `Generated: ${new Date().toLocaleString('vi-VN')}  |  Model: llama-3.1-8b-instant (Groq API)  |  Agents: content-creator · data-analyst`;
  info.font  = { size: 9, italic: true, color: { argb: 'FF888888' } };
  info.alignment = { horizontal: 'center' };
  ws.getRow(2).height = 18;

  blankRow(ws);

  // ── Section: Agent summary ──
  const r4 = ws.getRow(4);
  ['Sub-agent', 'Skills sử dụng', 'Output file', 'Trạng thái'].forEach((h, i) => {
    headerCell(r4.getCell(i + 1), h, { color: PINK_DARK });
  });
  ws.getRow(4).height = 22;

  const agents = [
    ['🎨 content-creator', 'caption-batch-generator\nhashtag-generator', 'june-content-creator.txt', '✅ Done'],
    ['📊 data-analyst',    'trend-tracker (Groq API)\nperformance-reporter',  'june-data-analyst.txt',   '✅ Done'],
  ];
  agents.forEach((row, i) => {
    const r = ws.getRow(5 + i);
    row.forEach((val, j) => {
      dataCell(r.getCell(j + 1), val, { fill: i % 2 === 0 ? PINK : WHITE, align: j === 0 ? 'center' : 'left', bold: j === 0 });
    });
    r.height = 36;
  });

  blankRow(ws);

  // ── Section: Key Metrics ──
  titleCell(ws, 8, 4, '📈 Key Metrics — Tháng 5 (baseline)', 'FFFF69B4');
  const r9 = ws.getRow(9);
  ['Metric', 'Giá trị', 'So sánh', 'Ghi chú'].forEach((h, i) => {
    headerCell(r9.getCell(i + 1), h, { color: PINK_DARK });
  });
  const metrics = [
    ['Total Posts',          '30 posts',  '+100% vs prev', 'Dữ liệu mẫu May–Jun 2026'],
    ['Avg Engagement Rate',  '10.10%',    '+100% vs prev', 'Tips/How-to cao nhất 10.4%'],
    ['Total Reach',          '82,780',    '+100% vs prev', 'Top post: 4,000 reach'],
    ['Top Post Likes',       '347 likes', '+100% vs prev', 'Feature promo — Jun update'],
    ['Best Performing Day',  'Wednesday', 'Avg ER 10.6%',  'Khung giờ tốt: 8–9 AM'],
    ['Best Content Type',    'Tips/How-to','Avg ER 10.4%', '10/30 posts, 4/5 top posts'],
  ];
  metrics.forEach((row, i) => {
    const r = ws.getRow(10 + i);
    row.forEach((val, j) => {
      dataCell(r.getCell(j + 1), val, { fill: i % 2 === 0 ? 'FFFFF0F5' : WHITE });
    });
    r.height = 20;
  });

  blankRow(ws);

  // ── Section: Action Plan ──
  titleCell(ws, 17, 4, '🗓️ Action Plan — Tháng 6 / 2026', 'FFFF69B4');
  const r18 = ws.getRow(18);
  ['Ưu tiên', 'Hành động', 'Cơ sở dữ liệu', 'Thực hiện tuần'].forEach((h, i) => {
    headerCell(r18.getCell(i + 1), h, { color: PINK_DARK });
  });
  const actions = [
    ['🔴 HIGH', '2× Tips/How-to posts/tuần',        'ER cao nhất 10.4%, 4/5 top posts', 'W1–W4'],
    ['🔴 HIGH', 'Đăng Wed 8–9 AM',                  'Best day Wed (10.6% ER)',           'W1–W4'],
    ['🟡 MED',  'Ra mắt AI caption feature tuần 1', 'Feature promo đạt 11.3% ER',        'W1'],
    ['🟡 MED',  'Dùng #ProductivityHacks cluster',  'Groq: rising tags tháng 6',         'W1–W4'],
    ['🟢 LOW',  'Giảm Behind-scenes từ 6→3 posts',  'Lowest ER 9.8%, reach thấp',        'W2–W3'],
  ];
  actions.forEach((row, i) => {
    const r = ws.getRow(19 + i);
    row.forEach((val, j) => {
      dataCell(r.getCell(j + 1), val, {
        fill: i % 2 === 0 ? 'FFFFF0F5' : WHITE,
        bold: j === 0,
        align: j === 0 ? 'center' : 'left',
      });
    });
    r.height = 22;
  });

  blankRow(ws);

  // ── Section: Weekly calendar ──
  titleCell(ws, 25, 4, '📅 Lịch đăng bài — Tháng 6 / 2026', 'FFFF69B4');
  const r26 = ws.getRow(26);
  ['Tuần', 'Monday', 'Wednesday', 'Friday'].forEach((h, i) => {
    headerCell(r26.getCell(i + 1), h, { color: PINK_DARK });
  });
  const calendar = [
    ['W1 (1–7/6)',   'Mid-year goal review + hashtags', '🚀 Feature launch: AI captions', 'Summer productivity tips'],
    ['W2 (8–14/6)',  'How-to: 30-day content calendar', 'Beat the summer slump',           'June content planning'],
    ['W3 (15–21/6)', 'Half-year reset & reflection',    'Q3 success planning',             'Behind-the-scenes (milestone)'],
    ['W4 (22–28/6)', 'Social media consistency tips',   'Student growth story',            'Kiara Planner June recap'],
  ];
  calendar.forEach((row, i) => {
    const r = ws.getRow(27 + i);
    row.forEach((val, j) => {
      dataCell(r.getCell(j + 1), val, { fill: i % 2 === 0 ? PINK : WHITE, align: j === 0 ? 'center' : 'left', bold: j === 0 });
    });
    r.height = 28;
  });
}

// ════════════════════════════════════════════════════════════════════════════
// SHEET 2 — Captions + Hashtags (content-creator agent)
// ════════════════════════════════════════════════════════════════════════════
function buildSheet2(wb) {
  const ws = wb.addWorksheet('🎨 Captions & Hashtags');
  ws.properties.tabColor = { argb: PINK_DARK };

  ws.columns = [
    { key: 'no',       width: 6  },
    { key: 'theme',    width: 28 },
    { key: 'caption',  width: 52 },
    { key: 'tone',     width: 16 },
    { key: 'chars',    width: 8  },
    { key: 'hashtags', width: 55 },
  ];

  titleCell(ws, 1, 6, '🎨 CONTENT-CREATOR AGENT — Captions & Hashtags (Groq API)', PINK_DARK);
  ws.mergeCells(2, 1, 2, 6);
  const sub = ws.getCell(2, 1);
  sub.value = 'Model: llama-3.1-8b-instant  |  Platform: Instagram  |  Tháng 6 / 2026';
  sub.font  = { size: 9, italic: true, color: { argb: 'FF888888' } };
  sub.alignment = { horizontal: 'center' };

  blankRow(ws);

  const r4 = ws.getRow(4);
  ['#', 'Chủ đề', 'Caption (Groq API)', 'Tone', 'Chars', 'Hashtags (Groq API)'].forEach((h, i) => {
    headerCell(r4.getCell(i + 1), h, { color: PINK_DARK });
  });
  ws.getRow(4).height = 22;

  const captions = [
    { theme: 'Mid-year goal review',            caption: 'Reflecting on your journey so far 👀',                                                              tone: 'motivational', chars: 36,  hashtags: '#journeysofar #selfdiscovery #kiaraplanner #mindfulliving #traveljournal #kiaraapp #gratitudepractice #personalgrowth #wanderlustvibes #selfcarejourney' },
    { theme: 'Summer productivity tips',         caption: 'Stay focused, stay cool: top 3 productivity hacks for summer',                                     tone: 'friendly',     chars: 60,  hashtags: '' },
    { theme: 'June content planning',            caption: 'Plan your content, crush your goals',                                                               tone: 'modern',       chars: 35,  hashtags: '#contentstrategy #contentcalendar #kiaraplanner #crushyourgoals #socialmedia #productivityhacks #kiaraapp #plannertips #contentmarketing #goalsetting' },
    { theme: 'Half-year reset & reflection',     caption: 'Take a deep breath, it\'s time to refresh',                                                        tone: 'motivational', chars: 40,  hashtags: '' },
    { theme: 'Beat the summer slump',            caption: 'Don\'t let the summer heat slow you down',                                                          tone: 'friendly',     chars: 39,  hashtags: '' },
    { theme: 'Planning for Q3 success',          caption: 'Set yourself up for Q3 victory with Kiara Planner',                                                tone: 'motivational', chars: 49,  hashtags: '#kiaraplanner #productivityhacks #successmindset #kiaraapp #plannergoals #productivitytools #goalsettingtips #planneraddict #organizationtips #planningforvictory' },
    { theme: 'Social media consistency in June', caption: 'Stay on track and keep your social media game strong',                                              tone: 'modern',       chars: 52,  hashtags: '' },
    { theme: 'Kiara Planner June update',        caption: 'New features, new you: Kiara Planner June update',                                                  tone: 'friendly',     chars: 48,  hashtags: '' },
  ];

  captions.forEach((c, i) => {
    const r = ws.getRow(5 + i);
    const fill = i % 2 === 0 ? PINK : WHITE;
    dataCell(r.getCell(1), i + 1,     { fill, align: 'center', bold: true });
    dataCell(r.getCell(2), c.theme,   { fill });
    dataCell(r.getCell(3), c.caption, { fill });
    dataCell(r.getCell(4), c.tone,    { fill, align: 'center' });
    dataCell(r.getCell(5), c.chars,   { fill, align: 'center' });
    dataCell(r.getCell(6), c.hashtags || '(see top 3 below)', { fill, size: 9 });
    r.height = 32;
  });

  blankRow(ws);

  // Groq hashtag sets section
  titleCell(ws, 14, 6, '🏷️ Groq Hashtag Sets — Top 3 Captions', 'FFFF69B4');
  const r15 = ws.getRow(15);
  ['Caption', 'Chủ đề', '10 Hashtags từ Groq API', '', '', ''].forEach((h, i) => {
    if (i < 3) headerCell(r15.getCell(i + 1), h, { color: PINK_DARK });
  });
  ws.mergeCells(15, 3, 15, 6);

  const hashtagSets = [
    { cap: 'Reflecting on your journey so far 👀',             theme: 'Mid-year goal review',   tags: '#journeysofar #selfdiscovery #kiaraplanner #mindfulliving #traveljournal #kiaraapp #gratitudepractice #personalgrowth #wanderlustvibes #selfcarejourney' },
    { cap: 'Plan your content, crush your goals',               theme: 'June content planning',  tags: '#contentstrategy #contentcalendar #kiaraplanner #crushyourgoals #socialmedia #productivityhacks #kiaraapp #plannertips #contentmarketing #goalsetting' },
    { cap: 'Set yourself up for Q3 victory with Kiara Planner', theme: 'Planning for Q3 success', tags: '#kiaraplanner #productivityhacks #successmindset #kiaraapp #plannergoals #productivitytools #goalsettingtips #planneraddict #organizationtips #planningforvictory' },
  ];

  hashtagSets.forEach((h, i) => {
    const r = ws.getRow(16 + i);
    ws.mergeCells(16 + i, 3, 16 + i, 6);
    const fill = i % 2 === 0 ? PINK : WHITE;
    dataCell(r.getCell(1), h.cap,   { fill, size: 9 });
    dataCell(r.getCell(2), h.theme, { fill, bold: true });
    dataCell(r.getCell(3), h.tags,  { fill, size: 9 });
    r.height = 40;
  });
}

// ════════════════════════════════════════════════════════════════════════════
// SHEET 3 — Trend Analysis + Performance Report (data-analyst agent)
// ════════════════════════════════════════════════════════════════════════════
function buildSheet3(wb) {
  const ws = wb.addWorksheet('📊 Trend & Performance');
  ws.properties.tabColor = { argb: PINK_DARK };

  ws.columns = [
    { key: 'a', width: 8  },
    { key: 'b', width: 30 },
    { key: 'c', width: 14 },
    { key: 'd', width: 12 },
    { key: 'e', width: 12 },
    { key: 'f', width: 36 },
  ];

  titleCell(ws, 1, 6, '📊 DATA-ANALYST AGENT — Trend Analysis & Performance Report', PINK_DARK);
  ws.mergeCells(2, 1, 2, 6);
  const sub = ws.getCell(2, 1);
  sub.value = 'Skill: trend-tracker (Groq API llama-3.1-8b-instant) + performance-reporter  |  Data: 30 posts May–Jun 2026';
  sub.font  = { size: 9, italic: true, color: { argb: 'FF888888' } };
  sub.alignment = { horizontal: 'center' };

  blankRow(ws);

  // ── Trending hashtags from Groq ──
  titleCell(ws, 4, 6, '🔥 PART 2: External Trend Intelligence (Groq API)', 'FFFF69B4');
  const r5 = ws.getRow(5);
  ['Rank', 'Hashtag', 'Category', 'Momentum', 'Source', 'Why'].forEach((h, i) => {
    headerCell(r5.getCell(i + 1), h, { color: PINK_DARK });
  });
  ws.getRow(5).height = 22;

  const groqTags = [
    [1,  '#ProductivityHacks',      'niche',   'rising', 'Groq API', 'Kiara Planner users sharing productivity workflows'],
    [2,  '#PlanYourContent',        'niche',   'peak',   'Groq API', 'Top creators using content planning tools'],
    [3,  '#CreatorProductivity',    'niche',   'stable', 'Groq API', 'Stable interest in productivity for creators'],
    [4,  '#SocialMediaManagement',  'niche',   'rising', 'Groq API', 'Integration with social media tools trending'],
    [5,  '#GoalSetting2026',        'niche',   'rising', 'Groq API', 'Mid-year goal reviews driving this tag'],
    [6,  '#PlannerLove',            'branded', 'peak',   'Groq API', 'Kiara Planner trending on Instagram'],
    [7,  '#OrganizeYourLife',       'niche',   'rising', 'Groq API', 'Users seeking digital organization help'],
    [8,  '#TimeManagementTips',     'niche',   'stable', 'Groq API', 'Creators sharing time management content'],
    [9,  '#ContentPlanningTools',   'niche',   'rising', 'Groq API', 'Tool exploration increasing in niche'],
    [10, '#StayFocused',            'niche',   'rising', 'Groq API', 'Focus-related content performing well'],
  ];

  groqTags.forEach((row, i) => {
    const r = ws.getRow(6 + i);
    const fill = i % 2 === 0 ? PINK : WHITE;
    const momentumColor = row[3] === 'rising' ? 'FF228B22' : row[3] === 'peak' ? 'FFFF8C00' : FONT_DARK;
    row.forEach((val, j) => {
      dataCell(r.getCell(j + 1), val, {
        fill,
        align: j < 2 ? 'center' : 'left',
        bold: j === 1,
        color: j === 3 ? momentumColor : FONT_DARK,
      });
    });
    r.height = 22;
  });

  blankRow(ws);

  // ── Declining tags ──
  titleCell(ws, 17, 6, '📉 Declining Tags to Avoid', 'FFFF69B4');
  ws.mergeCells(18, 1, 18, 6);
  const decCell = ws.getCell(18, 1);
  decCell.value = '#OldSchoolPlanning  ·  #DisorganizedLife  ·  #LackOfFocus  ·  #UnproductiveHabits  ·  #OutdatedProductivityTips';
  decCell.font  = { size: 10, color: { argb: 'FFCC0000' }, bold: true };
  decCell.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF0F0' } };
  decCell.alignment = { horizontal: 'center' };
  ws.getRow(18).height = 22;

  blankRow(ws);

  // ── Performance report ──
  titleCell(ws, 20, 6, '📋 Performance Report — Tháng 5 (Baseline cho tháng 6)', 'FFFF69B4');
  const r21 = ws.getRow(21);
  ['Rank', 'Post Content (truncated)', 'ER %', 'Likes', 'Reach', 'Content Type'].forEach((h, i) => {
    headerCell(r21.getCell(i + 1), h, { color: PINK_DARK });
  });
  ws.getRow(21).height = 22;

  const topPosts = [
    [1, 'How one student creator grew to 10k followers in 90 days…', '11.4%', 345, 3950, 'Tips/How-to'],
    [2, 'June feature drop: AI-assisted caption suggestions now live…', '11.3%', 347, 4000, 'Feature promo'],
    [3, '3 reasons why your Instagram reach is dropping (and fix)…', '10.8%', 334, 3950, 'Tips/How-to'],
    [4, 'How to write a 30-day content calendar in under an hour…', '10.6%', 322, 3900, 'Tips/How-to'],
    [5, 'Every big account started with zero followers. Keep going…', '10.6%', 265, 2900, 'Motivational'],
  ];

  topPosts.forEach((row, i) => {
    const r = ws.getRow(22 + i);
    const fill = i % 2 === 0 ? PINK : WHITE;
    row.forEach((val, j) => {
      dataCell(r.getCell(j + 1), val, {
        fill,
        align: j === 0 || j === 2 ? 'center' : j === 3 || j === 4 ? 'right' : 'left',
        bold: j === 0,
      });
    });
    r.height = 28;
  });

  blankRow(ws);

  // ── Content breakdown ──
  titleCell(ws, 28, 6, '📊 Content Type Breakdown', 'FFFF69B4');
  const r29 = ws.getRow(29);
  ['Content Type', 'Count', 'Avg ER', 'Ghi chú', '', ''].forEach((h, i) => {
    if (i < 4) headerCell(r29.getCell(i + 1), h, { color: PINK_DARK });
  });
  ws.mergeCells(29, 4, 29, 6);

  const breakdown = [
    ['Tips/How-to',   10, '10.4%', '⭐ Highest ER — tăng tần suất cho tháng 6'],
    ['Motivational',   9, '10.0%', 'Ổn định — giữ đều 2/tuần'],
    ['Feature promo',  5, '10.0%', 'Tập trung vào tuần 1 (AI caption launch)'],
    ['Behind scenes',  6, '9.8%',  '⬇️ Lowest ER — giảm xuống 3 posts'],
  ];

  breakdown.forEach((row, i) => {
    const r = ws.getRow(30 + i);
    ws.mergeCells(30 + i, 4, 30 + i, 6);
    const fill = i % 2 === 0 ? PINK : WHITE;
    row.forEach((val, j) => {
      dataCell(r.getCell(j + 1), val, {
        fill,
        align: j === 1 || j === 2 ? 'center' : 'left',
        bold: j === 0,
        color: j === 2 ? (i === 0 ? 'FF228B22' : i === 3 ? 'FFCC0000' : FONT_DARK) : FONT_DARK,
      });
    });
    r.height = 22;
  });

  blankRow(ws);

  // ── Posting pattern ──
  titleCell(ws, 35, 6, '⏰ Posting Pattern & Best Times', 'FFFF69B4');
  ws.mergeCells(36, 1, 36, 6);
  const patternCell = ws.getCell(36, 1);
  patternCell.value = 'Best Day: Wednesday (10.6% ER)  ·  Best Time: 8–9 AM local / 12–3 PM EST (Groq)  ·  Frequency: 3×/week (Mon · Wed · Fri)';
  patternCell.font  = { bold: true, size: 10, color: { argb: FONT_DARK } };
  patternCell.fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: PINK } };
  patternCell.alignment = { horizontal: 'center' };
  ws.getRow(36).height = 24;
}

// ════════════════════════════════════════════════════════════════════════════
// MAIN
// ════════════════════════════════════════════════════════════════════════════
async function main() {
  const wb = new ExcelJS.Workbook();
  wb.creator  = 'Kiara Planner — Claude Code Agent';
  wb.created  = new Date();
  wb.modified = new Date();

  buildSheet1(wb);
  buildSheet2(wb);
  buildSheet3(wb);

  const outPath = path.join(__dirname, '..', 'demo-output', 'june-campaign-2026.xlsx');
  await wb.xlsx.writeFile(outPath);
  console.log(`✅ Saved: ${outPath}`);
}

main().catch((err) => { console.error(err); process.exit(1); });
