// 测试用户数据 - 账号密码记录
// 密码统一为: Test@123

export const testUsers = [
  {
    username: '张明_程序员',
    email: 'zhangming@zhida.com',
    password: 'Test@123',
    bio: '全栈开发工程师，热爱开源，专注于云原生和微服务架构',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhangming',
    role: '程序员'
  },
  {
    username: '李雪_UI设计师',
    email: 'lixue@zhida.com',
    password: 'Test@123',
    bio: '资深UI/UX设计师，专注于用户体验和视觉设计',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lixue',
    role: 'UI设计师'
  },
  {
    username: '王强_产品经理',
    email: 'wangqiang@zhida.com',
    password: 'Test@123',
    bio: '互联网产品经理，5年B端产品经验，擅长需求分析和产品规划',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=wangqiang',
    role: '产品经理'
  },
  {
    username: '陈小雨_大学生',
    email: 'chenxiaoyu@zhida.com',
    password: 'Test@123',
    bio: '计算机专业大三学生，正在学习前端开发，喜欢探索新技术',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=chenxiaoyu',
    role: '大学生'
  },
  {
    username: '刘洋_创业者',
    email: 'liuyang@zhida.com',
    password: 'Test@123',
    bio: '连续创业者，正在做AI教育方向，关注商业和技术结合',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=liuyang',
    role: '创业者'
  },
  {
    username: '赵静_数据分析师',
    email: 'zhaojing@zhida.com',
    password: 'Test@123',
    bio: '数据分析师，精通Python和SQL，专注于数据驱动决策',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhaojing',
    role: '数据分析师'
  },
  {
    username: '周薇_自媒体博主',
    email: 'zhouwei@zhida.com',
    password: 'Test@123',
    bio: '科技自媒体博主，全网50万粉丝，专注科技评测和行业观察',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhouwei',
    role: '自媒体博主'
  },
  {
    username: '吴老师_教育者',
    email: 'wulaoshi@zhida.com',
    password: 'Test@123',
    bio: '高校计算机教师，10年教学经验，关注编程教育和人才培养',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=wulaoshi',
    role: '教师'
  },
  {
    username: '郑凯_运营专员',
    email: 'zhengkai@zhida.com',
    password: 'Test@123',
    bio: '互联网运营，擅长用户增长和社区运营，热爱内容创作',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhengkai',
    role: '运营专员'
  },
  {
    username: '孙悦_自由职业',
    email: 'sunyue@zhida.com',
    password: 'Test@123',
    bio: '自由职业者，独立开发者，远程工作践行者',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sunyue',
    role: '自由职业'
  }
]

// 每个用户的问题列表
export const userQuestions = {
  '张明_程序员': [
    { title: '如何优雅地处理微服务中的分布式事务？', tags: '微服务,分布式,架构', content: '在微服务架构中，分布式事务一直是个难题。目前我们使用Saga模式，但感觉实现起来比较复杂。有没有更好的方案推荐？' },
    { title: 'K8s 生产环境最佳实践有哪些？', tags: 'Kubernetes,DevOps,云原生', content: '准备将生产环境迁移到 Kubernetes，想了解有哪些最佳实践和需要避开的坑？' },
    { title: 'Redis 集群方案对比：Codis vs Redis Cluster', tags: 'Redis,缓存,分布式', content: '需要对 Redis 做集群化，目前考虑 Codis 和官方 Redis Cluster，各有什么优缺点？' },
    { title: '如何设计一个高并发的秒杀系统？', tags: '高并发,架构,性能优化', content: '公司要做秒杀活动，预计 QPS 10万+，需要考虑哪些技术点？' },
    { title: 'Golang vs Java：后端语言选择建议', tags: 'Golang,Java,后端', content: '新项目技术选型，在 Go 和 Java 之间犹豫，大家有什么建议？' },
    { title: '如何做好代码审查？', tags: '代码质量,团队协作,最佳实践', content: '团队代码审查流于形式，想改进 Code Review 流程，有什么好的实践分享？' },
    { title: 'DDD 领域驱动设计实战经验分享', tags: 'DDD,架构,设计模式', content: '最近在学习 DDD，感觉理论很美好但实践起来很难，有经验的朋友能分享一下吗？' },
    { title: '开源项目如何吸引更多贡献者？', tags: '开源,社区,GitHub', content: '维护了一个开源项目，但贡献者很少，如何吸引更多人参与？' },
    { title: 'CI/CD 流水线最佳实践', tags: 'CI/CD,DevOps,自动化', content: '想优化团队的 CI/CD 流程，目前用的是 Jenkins，有什么改进建议？' },
    { title: '程序员如何提升技术影响力？', tags: '职业发展,个人成长,技术', content: '作为程序员，除了写代码，还有什么方式可以提升技术影响力？' }
  ],
  '李雪_UI设计师': [
    { title: '2024年UI设计趋势预测', tags: 'UI设计,趋势,设计', content: '新的一年，UI设计会有哪些新趋势？大家一起讨论一下。' },
    { title: 'Figma vs Sketch：设计工具选择', tags: 'Figma,Sketch,设计工具', content: '团队在选设计工具，Figma 和 Sketch 各有什么优势？' },
    { title: '如何建立设计规范系统？', tags: '设计规范,Design System,UI', content: '公司要建立统一的设计规范，应该从哪些方面入手？' },
    { title: '设计师如何与开发更好地协作？', tags: '团队协作,设计交付,沟通', content: '设计和开发之间经常有理解偏差，如何改善协作流程？' },
    { title: '动效设计在UI中的重要性', tags: '动效设计,交互设计,UI', content: '好的动效能提升用户体验，但如何把握动效的度？' },
    { title: '移动端设计适配最佳实践', tags: '移动端,响应式设计,UI', content: 'Android 和 iOS 设计规范不同，如何做好跨平台适配？' },
    { title: '如何提升设计审美能力？', tags: '设计,审美,学习', content: '感觉自己的设计总是差点意思，如何提升审美和设计感？' },
    { title: '暗黑模式设计指南', tags: '暗黑模式,UI设计,用户体验', content: '要做暗黑模式适配，有哪些设计原则和注意事项？' },
    { title: '设计作品集如何准备？', tags: '作品集,求职,设计师', content: '准备找工作，设计作品集应该包含哪些内容？' },
    { title: 'AI 设计工具会取代设计师吗？', tags: 'AI,设计,职业发展', content: 'Midjourney、Stable Diffusion 等 AI 工具越来越强，设计师会被取代吗？' }
  ],
  '王强_产品经理': [
    { title: '如何写好一份产品需求文档？', tags: 'PRD,产品经理,需求', content: '新人产品经理，想学习如何写出清晰、完整的 PRD 文档。' },
    { title: 'B端产品如何做用户调研？', tags: 'B端,用户调研,产品', content: 'B端产品用户少且分散，如何有效进行用户调研？' },
    { title: '产品经理需要懂技术吗？', tags: '产品经理,技术,职业发展', content: '作为产品经理，需要懂多少技术？懂到什么程度合适？' },
    { title: '如何评估一个功能是否值得做？', tags: '需求分析,优先级,产品', content: '需求方提了很多需求，如何科学评估优先级？' },
    { title: '竞品分析框架和方法', tags: '竞品分析,产品,市场', content: '做竞品分析时，应该从哪些维度进行分析？' },
    { title: '产品从0到1的关键节点', tags: '产品规划,创业,从0到1', content: '一个新产品从想法到上线，需要经历哪些关键节点？' },
    { title: '如何做好产品数据分析？', tags: '数据分析,产品,指标', content: '产品上线后，应该关注哪些核心指标？如何分析？' },
    { title: '敏捷开发中产品经理的角色', tags: '敏捷开发,Scrum,产品', content: '在敏捷团队中，产品经理应该如何定位自己的角色？' },
    { title: '如何管理多方需求冲突？', tags: '需求管理,沟通,产品', content: '业务方、用户、技术各方的需求经常冲突，如何平衡？' },
    { title: '产品经理的职业发展路径', tags: '职业发展,产品经理,成长', content: '产品经理做了几年后，有哪些发展方向可以选择？' }
  ],
  '陈小雨_大学生': [
    { title: '计算机专业学生应该学哪些技术栈？', tags: '学习,计算机,技术栈', content: '大三了，想提前准备找工作，应该重点学习哪些技术？' },
    { title: '如何平衡课程学习和自学编程？', tags: '学习,时间管理,大学', content: '学校课程和自学内容冲突，如何合理安排时间？' },
    { title: '实习面试需要准备什么？', tags: '实习,面试,求职', content: '准备找暑期实习，面试一般会问什么？如何准备？' },
    { title: '考研还是直接工作？', tags: '考研,就业,选择', content: '大三了很纠结，是考研还是直接找工作？各有什么利弊？' },
    { title: 'GitHub 上有哪些值得学习的开源项目？', tags: 'GitHub,开源,学习', content: '想通过看开源项目提升代码能力，有什么推荐？' },
    { title: '前端学习路线推荐', tags: '前端,学习,路线', content: '想学前端开发，应该按什么顺序学习？' },
    { title: '如何积累项目经验？', tags: '项目经验,学习,简历', content: '简历上没有项目经验，如何积累实战项目？' },
    { title: '算法题刷多少够用？', tags: '算法,面试,LeetCode', content: '准备面试，LeetCode 要刷多少题才够？' },
    { title: '计算机专业要不要读研？', tags: '考研,计算机,深造', content: '家里想让我读研，但我想早点工作，该怎么选择？' },
    { title: '如何找到靠谱的实习机会？', tags: '实习,求职,渠道', content: '学校的招聘信息有限，还有哪些渠道找实习？' }
  ],
  '刘洋_创业者': [
    { title: '创业公司如何做冷启动？', tags: '创业,冷启动,增长', content: '产品刚上线，用户增长很慢，有哪些有效的冷启动策略？' },
    { title: '融资时投资人最关心什么？', tags: '融资,投资,创业', content: '准备融资，想知道投资人最看重哪些指标？' },
    { title: '技术创业者如何找合伙人？', tags: '创业,合伙人,团队', content: '我是技术背景，想找商业合伙人，有什么好的渠道？' },
    { title: 'AI 教育赛道的机遇与挑战', tags: 'AI,教育,创业', content: '在做 AI+教育方向，想和大家探讨这个赛道的机遇和挑战。' },
    { title: '创业公司如何做 MVP 验证？', tags: 'MVP,创业,产品', content: '有一个创业想法，如何快速验证是否可行？' },
    { title: '小团队如何高效协作？', tags: '团队管理,协作,创业', content: '我们团队只有5个人，如何保持高效协作？' },
    { title: '创业公司的股权分配原则', tags: '股权,创业,合伙人', content: '初创团队如何合理分配股权？有什么原则可以参考？' },
    { title: '如何从0到1搭建商业模式？', tags: '商业模式,创业,战略', content: '有产品但还没想清楚怎么赚钱，如何设计商业模式？' },
    { title: '创业过程中最大的坑是什么？', tags: '创业,经验,避坑', content: '创业两年，踩了不少坑，想听听大家的经验分享。' },
    { title: '创业者如何保持心理健康？', tags: '心理健康,创业,压力', content: '创业压力很大，如何调节心态，保持心理健康？' }
  ],
  '赵静_数据分析师': [
    { title: 'Python 数据分析入门书籍推荐', tags: 'Python,数据分析,书籍', content: '想学 Python 做数据分析，有什么好书推荐？' },
    { title: 'SQL 优化技巧分享', tags: 'SQL,优化,数据库', content: '整理了一些常用的 SQL 优化技巧，分享给大家。' },
    { title: '如何建立数据指标体系？', tags: '数据指标,分析,产品', content: '公司要做数据化运营，如何搭建完整的数据指标体系？' },
    { title: '数据分析师需要懂机器学习吗？', tags: '机器学习,数据分析,职业', content: '数据分析岗位，需要掌握机器学习到什么程度？' },
    { title: 'Tableau vs Power BI：BI工具选择', tags: 'Tableau,Power BI,可视化', content: '公司要选 BI 工具，Tableau 和 Power BI 怎么选？' },
    { title: '如何用数据驱动产品决策？', tags: '数据驱动,产品,决策', content: '如何让数据真正影响产品决策，而不是流于形式？' },
    { title: '数据分析师的职业发展路径', tags: '职业发展,数据分析,成长', content: '数据分析做了几年，有哪些发展方向可以选择？' },
    { title: 'A/B 测试实战经验分享', tags: 'A/B测试,实验,数据分析', content: '做了很多 A/B 测试，分享一些实战经验和注意事项。' },
    { title: '数据可视化的设计原则', tags: '数据可视化,设计,图表', content: '好的数据可视化能讲故事，有哪些设计原则？' },
    { title: '如何处理脏数据？', tags: '数据清洗,ETL,分析', content: '经常遇到数据质量问题，如何高效处理脏数据？' }
  ],
  '周薇_自媒体博主': [
    { title: '2024年自媒体还有机会吗？', tags: '自媒体,创业,趋势', content: '很多人说自媒体红利期已过，2024年入局还有机会吗？' },
    { title: '如何打造个人IP？', tags: '个人IP,品牌,自媒体', content: '想在科技领域建立个人品牌，有什么方法论？' },
    { title: '短视频 vs 长图文：内容形式选择', tags: '短视频,图文,内容', content: '做科技内容，短视频和长图文哪个效果更好？' },
    { title: '如何保持持续的内容输出？', tags: '内容创作,持续输出,自媒体', content: '做自媒体最大的挑战是持续输出，如何保持？' },
    { title: '科技博主如何接商业合作？', tags: '商业合作,变现,自媒体', content: '有了一些粉丝，如何接到合适的商业合作？' },
    { title: '内容创作的灵感来源', tags: '内容创作,灵感,写作', content: '经常不知道写什么，大家的内容灵感从哪里来？' },
    { title: '多平台分发策略', tags: '多平台,分发,流量', content: '内容应该在多个平台分发吗？如何制定策略？' },
    { title: '如何与粉丝建立深度连接？', tags: '粉丝运营,社群,互动', content: '粉丝数在增长，但互动率在下降，如何改善？' },
    { title: '自媒体变现方式大盘点', tags: '变现,自媒体,商业模式', content: '除了广告，自媒体还有哪些变现方式？' },
    { title: '科技评测的选题技巧', tags: '选题,科技评测,内容', content: '做科技评测，如何选择有热度的选题？' }
  ],
  '吴老师_教育者': [
    { title: '如何激发学生对编程的兴趣？', tags: '编程教育,教学,兴趣', content: '很多学生觉得编程枯燥，有什么方法能激发他们的兴趣？' },
    { title: '大学计算机教育需要改革吗？', tags: '计算机教育,改革,大学', content: '感觉大学课程和企业需求脱节，应该如何改革？' },
    { title: '线上教学 vs 线下教学的优劣', tags: '线上教学,教育,对比', content: '疫情后线上教学普及，和传统线下教学相比各有什么优劣？' },
    { title: '如何培养学生的算法思维？', tags: '算法,思维,教学', content: '学生觉得算法难，如何培养他们的算法思维？' },
    { title: '编程教育应该从几岁开始？', tags: '编程教育,少儿,年龄', content: '少儿编程很火，孩子多大开始学编程比较合适？' },
    { title: '如何评价学生的学习效果？', tags: '评价,学习效果,教育', content: '编程能力如何量化评价？有什么好的方法？' },
    { title: '计算机专业毕业生能力缺口', tags: '毕业生,能力,就业', content: '企业反映毕业生能力不足，学校应该如何改进？' },
    { title: '如何做好课程设计？', tags: '课程设计,教学,教育', content: '设计一门新课程，应该考虑哪些因素？' },
    { title: '学生职业规划指导经验分享', tags: '职业规划,学生,指导', content: '经常给学生做职业规划指导，分享一些经验。' },
    { title: 'AI 时代教育者需要哪些新技能？', tags: 'AI,教育,技能', content: 'AI 正在改变教育，教师需要学习哪些新技能？' }
  ],
  '郑凯_运营专员': [
    { title: '用户增长的核心方法论', tags: '用户增长,运营,增长黑客', content: '做用户增长有一段时间了，总结了一些方法论分享给大家。' },
    { title: '社区运营如何提高活跃度？', tags: '社区运营,活跃度,用户', content: '负责一个技术社区，用户活跃度不高，如何提升？' },
    { title: '内容运营的选题策略', tags: '内容运营,选题,策略', content: '内容选题对运营效果影响很大，如何制定选题策略？' },
    { title: '活动运营如何做出爆款？', tags: '活动运营,爆款,营销', content: '策划过一些活动，效果一般，如何做出爆款活动？' },
    { title: '用户画像如何构建和应用？', tags: '用户画像,运营,数据', content: '想给用户做精准运营，如何构建有效的用户画像？' },
    { title: '私域运营的正确打开方式', tags: '私域,运营,社群', content: '私域很火，但如何做好私域运营？' },
    { title: '运营数据分析入门', tags: '数据分析,运营,入门', content: '运营需要看哪些数据？如何分析？' },
    { title: '如何写好运营方案？', tags: '运营方案,策划,写作', content: '经常要写运营方案，如何写出高质量的方案？' },
    { title: '运营人需要哪些核心能力？', tags: '运营,能力,职业', content: '想做好运营，需要培养哪些核心能力？' },
    { title: 'B端和C端运营的区别', tags: 'B端,C端,运营', content: '从C端转B端运营，发现差异很大，分享一下感受。' }
  ],
  '孙悦_自由职业': [
    { title: '自由职业一年，我的收获与反思', tags: '自由职业,经验,分享', content: '做自由职业一年了，分享一下这段时间的收获和反思。' },
    { title: '如何找到第一个远程工作？', tags: '远程工作,求职,自由职业', content: '想做远程工作，如何找到第一份机会？' },
    { title: '独立开发者如何定价自己的服务？', tags: '独立开发,定价,自由职业', content: '接外包项目，如何合理定价？' },
    { title: '自由职业如何管理时间？', tags: '时间管理,自由职业,效率', content: '自由职业最大的挑战是自律，如何做好时间管理？' },
    { title: '远程协作工具有哪些推荐？', tags: '远程协作,工具,效率', content: '远程工作需要好的工具，大家有哪些推荐？' },
    { title: '自由职业者如何交社保？', tags: '社保,自由职业,政策', content: '自由职业后社保怎么交？有哪些注意事项？' },
    { title: '如何建立稳定的客户来源？', tags: '客户,自由职业,获客', content: '自由职业最怕没客户，如何建立稳定的获客渠道？' },
    { title: '独立开发的产品如何推广？', tags: '独立开发,推广,产品', content: '自己做了个小产品，如何低成本推广？' },
    { title: '自由职业的税务处理经验', tags: '税务,自由职业,经验', content: '分享一下自由职业者处理税务的经验。' },
    { title: '如何应对自由职业的孤独感？', tags: '心理,自由职业,生活', content: '自由职业有时很孤独，大家是如何应对的？' }
  ]
}

// 生成种子数据的函数
export function generateSeedData() {
  const users = []
  const questions = []
  const answers = []
  
  let userIdCounter = 1000
  let questionIdCounter = 100
  let answerIdCounter = 1000
  
  // 创建用户
  testUsers.forEach((user, index) => {
    users.push({
      id: (userIdCounter + index).toString(),
      username: user.username,
      email: user.email,
      password: user.password,
      avatar: user.avatar,
      bio: user.bio,
      followers: 0,
      following: 0,
      createdAt: new Date(2024, 0, index + 1).toISOString()
    })
  })
  
  // 创建问题
  const now = new Date()
  users.forEach((user, userIndex) => {
    const questionsForUser = userQuestions[user.username] || []
    questionsForUser.forEach((q, qIndex) => {
      questions.push({
        id: (questionIdCounter + questions.length).toString(),
        title: q.title,
        content: q.content,
        authorId: user.id,
        tags: q.tags.split(',').map(t => t.trim()),
        views: Math.floor(Math.random() * 500) + 50,
        createdAt: new Date(now - (userIndex * 24 * 60 * 60 * 1000) - (qIndex * 60 * 60 * 1000)).toISOString()
      })
    })
  })
  
  // 创建一些回答
  const sampleAnswers = [
    '感谢提问！这个问题我也遇到过，分享一下我的经验...',
    '很好的问题！我的看法是...',
    '我之前做过类似的项目，可以给你一些建议...',
    '这个问题没有标准答案，取决于具体场景...',
    '推荐你看一下这篇文章/书籍...',
    '我是这样理解的...',
    '可以尝试以下方法...',
    '这个需要根据实际情况来定...'
  ]
  
  questions.slice(0, 50).forEach((question, index) => {
    // 每个问题有 0-3 个回答
    const answerCount = Math.floor(Math.random() * 4)
    for (let i = 0; i < answerCount; i++) {
      const randomUser = users[Math.floor(Math.random() * users.length)]
      answers.push({
        id: (answerIdCounter + answers.length).toString(),
        questionId: question.id,
        content: sampleAnswers[Math.floor(Math.random() * sampleAnswers.length)] + `\n\n希望对你有帮助！`,
        authorId: randomUser.id,
        likes: Math.floor(Math.random() * 50),
        dislikes: Math.floor(Math.random() * 5),
        createdAt: new Date(new Date(question.createdAt).getTime() + (i + 1) * 60 * 60 * 1000).toISOString()
      })
    }
  })
  
  return { users, questions, answers }
}
