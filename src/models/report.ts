import { GroupOwnable } from './interfaces'
import Group from './group'
import Example from './example'
import { SORT_ORDER, SORT_KEY } from './types'
import axios from 'axios'

export default class Report implements GroupOwnable {
  // フィールド
  sourceURL: string
  source: any
  startTime: Date
  endTime: Date
  ci: {
    branchName: string
    buildUrl: string
    commitHash: string
    pullRequestUrl: string
  }
  groups: Group[]
  repositoryName: string

  // キャッシュ
  totalTime?: number
  formattedTotalTime?: string

  constructor(sourceURL: string, source: any) {
    this.sourceURL = sourceURL
    this.source = source
    this.startTime = new Date(source.start_time * 1000)
    this.endTime = new Date(source.end_time * 1000)
    this.ci = {
      branchName: source.ci.branch_name,
      buildUrl: source.ci.build_url,
      commitHash: source.ci.commit_hash,
      pullRequestUrl: source.ci.pull_request_url
    }
    this.groups = []
    this.repositoryName = process.env.REACT_APP_REPOSITORY_NAME || 'undefined repository name'
    this.reset()
  }

  /**
   * テストレポートをフェッチし、Reportオブジェクトを生成する
   * @param url テストレポートファイルが配置されているURL or Path
   */
  static fetch(sourceURL: string): Promise<Report> {
    return axios.get(sourceURL).then(res => {
      try {
        return Promise.resolve(new Report(sourceURL, res.data))
      } catch (e) {
        return Promise.reject(e)
      }
    })
  }

  /**
   * データソースを元にグループ一覧を再帰的に定義する
   */
  reset(): this {
    this.groups = Object.keys(this.source.groups).map(groupName => {
      return new Group(null, groupName, this.source.groups[groupName])
    })
    this.sort('Name', 'asc')
    return this
  }

  /**
   * Exampleステータスに応じてグループリストをフィルタリングする
   */
  filter(keyword: string, { passed = true, failed = true, pending = true }) {
    this.reset()
    this.groups = this.groups
      .filter(g => g.name.match(keyword))
      .filter(group => group.filterByExampleStatus({ passed, failed, pending }))
  }

  /**
   * Group及びExampleをまとめて並び替える
   */
  sort(key: SORT_KEY, order: SORT_ORDER) {
    Group.sort(this.groups, key, order, false)
  }

  /**
   * Examleのリストを、groupsを再帰的に走査して取得する
   * FIXME: 怠惰なgetterにするなりキャッシュしたほうが良いかも
   */
  getAllExamples(): Example[] {
    return this.groups.map(g => g.getAllExamples()).flat()
  }

  /**
   * 先頭のExampleを走査して取得する
   * NOTE: Example が一つないレポートは存在しないという前提の元、型アサーションする
   */
  firstExample(): Example {
    return this.getAllExamples()[0] as Example
  }

  /**
   * 全Example数を取得する
   */
  getTotalExampleCount(): number {
    return this.getAllExamples().length
  }

  /**
   * 全成功Example数を取得する
   */
  getPassedExampleCount(): number {
    return this.getAllExamples().filter(e => e.status === 'passed').length
  }

  /**
   * 全失敗Example数を取得する
   */
  getFailedExampleCount(): number {
    return this.getAllExamples().filter(e => e.status === 'failed').length
  }

  /**
   * 全保留Example数を取得する
   */
  getPendingExampleCount(): number {
    return this.getAllExamples().filter(e => e.status === 'pending').length
  }

  /**
   * 総実行時間を取得する
   * NOTE: startTimeとendTimeから算出できなくもない
   * FIXME: getAllExamples使えばよくない？
   */
  getTotalTime(): number {
    if (this.totalTime !== undefined) return this.totalTime

    this.totalTime = this.groups.reduce((total, group) => (total += group.getTotalTime()), 0)
    return this.totalTime
  }

  /**
   * 失敗したExampleの一覧を取得する
   */
  getFailedExamples(): Example[] {
    return this.getAllExamples().filter(e => e.status === 'failed')
  }

  /**
   * ブランチ名とリポジトリ名が設定されている場合、Githubnのコミット一覧ページのURLを戻す
   */
  getBranchUrl(): string | null {
    if (this.ci.branchName && this.repositoryName) {
      return `https://github.com/${this.repositoryName}/commits/${this.ci.branchName}`
    } else {
      return null
    }
  }

  /**
   * ソースコードのパスを元に、Github上のコードURLを戻す
   * @param {String} location
   */
  getLocationUrl(location: string): string | null {
    if (location && this.ci.branchName && this.repositoryName) {
      return `https://github.com/${this.repositoryName}/blob/${this.ci.branchName}/${location}`
    } else {
      return null
    }
  }

  /**
   * 実行時間をフォーマットした文字列を戻す
   * 未実行の場合00:00が戻るので注意
   * FIXME: groupクラスにも同じようなのあるので汎用化する
   */
  getFormattedTotalTime(): string {
    if (this.formattedTotalTime !== undefined) return this.formattedTotalTime

    const m = Math.floor(this.getTotalTime() / 60)
    const s = this.getTotalTime() % 60
    this.formattedTotalTime = `${('00' + String(m)).substr(-2)} min ${('00' + String(s)).substr(-2)} sec`
    return this.formattedTotalTime
  }

  /**
   * テスト開始日時をフォーマットした文字列を戻す
   */
  getFormattedStartTime(): string {
    return this.startTime.toLocaleString()
  }

  /**
   * テスト終了日時をフォーマットした文字列を戻す
   */
  getFormattedEndTime(): string {
    return this.endTime.toLocaleString()
  }
}
