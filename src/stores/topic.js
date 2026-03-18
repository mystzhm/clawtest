import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useTopicStore = defineStore('topic', () => {
  // 话题列表
  const topics = ref(JSON.parse(localStorage.getItem('topics') || '[]'))
  // 用户关注的话题
  const followedTopics = ref(JSON.parse(localStorage.getItem('followedTopics') || '[]'))

  function getCurrentUserId() {
    return JSON.parse(localStorage.getItem('currentUser'))?.id || null
  }

  // 创建话题
  function createTopic(name, description = '', icon = '') {
    const topic = {
      id: Date.now().toString(),
      name: name.trim().slice(0, 30),
      description: description.trim().slice(0, 200),
      icon,
      questionCount: 0,
      articleCount: 0,
      followerCount: 0,
      createdAt: new Date().toISOString()
    }
    topics.value.push(topic)
    saveTopics()
    return topic
  }

  // 关注话题
  function followTopic(topicId) {
    const userId = getCurrentUserId()
    if (!userId) return false

    const userFollowing = followedTopics.value.filter(f => f.userId === userId)
    if (!userFollowing.find(f => f.topicId === topicId)) {
      followedTopics.value.push({
        userId,
        topicId,
        followedAt: new Date().toISOString()
      })

      // 增加关注数
      const topic = topics.value.find(t => t.id === topicId)
      if (topic) {
        topic.followerCount++
      }

      saveFollowedTopics()
      saveTopics()
      return true
    }
    return false
  }

  // 取消关注话题
  function unfollowTopic(topicId) {
    const userId = getCurrentUserId()
    if (!userId) return false

    const index = followedTopics.value.findIndex(
      f => f.userId === userId && f.topicId === topicId
    )
    if (index > -1) {
      followedTopics.value.splice(index, 1)

      // 减少关注数
      const topic = topics.value.find(t => t.id === topicId)
      if (topic) {
        topic.followerCount = Math.max(0, topic.followerCount - 1)
      }

      saveFollowedTopics()
      saveTopics()
      return true
    }
    return false
  }

  // 检查是否关注
  function isFollowing(topicId) {
    const userId = getCurrentUserId()
    if (!userId) return false
    return followedTopics.value.some(f => f.userId === userId && f.topicId === topicId)
  }

  // 获取话题详情
  function getTopicById(id) {
    return topics.value.find(t => t.id === id)
  }

  // 获取话题下的问题
  function getQuestionsByTopic(topicName) {
    const questions = JSON.parse(localStorage.getItem('questions') || '[]')
    return questions.filter(q => q.tags && q.tags.includes(topicName))
  }

  // 获取话题下的文章
  function getArticlesByTopic(topicName) {
    const articles = JSON.parse(localStorage.getItem('articles') || '[]')
    return articles.filter(a => a.content.includes(topicName))
  }

  // 搜索话题
  function searchTopics(keyword) {
    const kw = keyword.toLowerCase()
    return topics.value.filter(t =>
      t.name.toLowerCase().includes(kw) ||
      t.description.toLowerCase().includes(kw)
    )
  }

  // 热门话题
  const hotTopics = computed(() => {
    return [...topics.value]
      .sort((a, b) => b.followerCount - a.followerCount)
      .slice(0, 20)
  })

  // 我关注的话题
  const myFollowedTopics = computed(() => {
    const userId = getCurrentUserId()
    if (!userId) return []
    const followedIds = followedTopics.value
      .filter(f => f.userId === userId)
      .map(f => f.topicId)
    return topics.value.filter(t => followedIds.includes(t.id))
  })

  // 增加问题计数
  function incrementQuestionCount(topicName) {
    const topic = topics.value.find(t => t.name === topicName)
    if (topic) {
      topic.questionCount++
      saveTopics()
    }
  }

  // 增加文章计数
  function incrementArticleCount(topicName) {
    const topic = topics.value.find(t => t.name === topicName)
    if (topic) {
      topic.articleCount++
      saveTopics()
    }
  }

  // 保存数据
  function saveTopics() {
    localStorage.setItem('topics', JSON.stringify(topics.value))
  }

  function saveFollowedTopics() {
    localStorage.setItem('followedTopics', JSON.stringify(followedTopics.value))
  }

  // 初始化默认话题
  function initDefaultTopics() {
    if (topics.value.length === 0) {
      const defaultTopics = [
        { name: '前端开发', description: '讨论前端技术、框架、工具' },
        { name: '后端开发', description: '讨论后端技术、架构、数据库' },
        { name: '人工智能', description: '讨论 AI 技术、机器学习、深度学习' },
        { name: '产品设计', description: '讨论产品设计、用户体验' },
        { name: '职场', description: '讨论职业发展、求职、 },
        { name: '生活', description: '分享生活经验、感悟' },
        { name: '读书', description: '推荐书籍、分享阅读心得' },
        { name: '电影', description: '推荐电影、分享观影感受' },
        { name: '音乐', description: '讨论音乐、分享好歌' }
      ]

      defaultTopics.forEach(t => {
        createTopic(t.name, t.description)
      })
    }
  }

  // 初始化
  initDefaultTopics()

  return {
    topics,
    hotTopics,
    myFollowedTopics,
    createTopic,
    followTopic,
    unfollowTopic,
    isFollowing,
    getTopicById,
    getQuestionsByTopic,
    getArticlesByTopic,
    searchTopics,
    incrementQuestionCount,
    incrementArticleCount,
    initDefaultTopics
  }
})
