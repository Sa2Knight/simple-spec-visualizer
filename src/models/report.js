import Group from './group'
import Example from './example'

export default class Report {
  constructor(source) {
    this.startTime = new Date(source.start_time)
    this.endTime = new Date(source.end_time)
    this.exampleCount = source.example_count
    this.failedCount = source.failed_count
    this.pendingCount = source.pending_count
    this.ci = {
      branchName: source.ci.branch_name,
      buildUrl: source.ci.build_url,
      commitHash: source.ci.commit_hash,
      pullRequestUrl: source.ci.pull_request_url
    }
    this.groups = Object.keys(source.groups).map(groupName => {
      return new Group(null, groupName, source.groups[groupName])
    })
  }

  /**
   * Group及びExampleをまとめて並び替える
   * @param {string} key
   * @param {'desc'|'asc'} order
   */
  sort(key, order) {
    this.groups.sort((a, b) => ('' + a.name).localeCompare(b.name))
    if (order === 'desc') {
      this.groups.reverse()
    }
  }

  /**
   * 先頭のExampleを走査して取得する
   * @return [Example]
   */
  firstExample() {
    let result = null
    this.groups.forEach(group => {
      result = group.firstExample()
      if (result) return
    })
    return result
  }
}
