import React from 'react'
import UIResultsLeftPainResultTree from './UIResultsLeftPainResultTree'
import UIResultsLeftPainFilters from './UIResultsLeftPainFilters'
import UIResultsLeftPainSortButtons from './UIResultsLeftPainSortButtons'
import UIResultsLeftPainSearchInput from './UIResultsLeftPainSearchInput'
import ReportContext from '../../context/report'
import Example from '../../models/example'
import { Divider, Grid } from '@material-ui/core/'
import { SORT_KEY, SORT_ORDER, EXAMPLE_STATUS } from '../../models/types'

type Props = {
  onSelectExample: (example: Example) => void
}

type State = {
  searchKeyword: string
  sortSetting: {
    key: SORT_KEY
    order: SORT_ORDER
  }
  checkedState: {
    passed: boolean
    failed: boolean
    pending: boolean
  }
}

export default class UIResultseLeftPain extends React.Component<Props, State> {
  static contextType = ReportContext

  constructor(props: Props) {
    super(props)
    this.state = {
      searchKeyword: '',
      sortSetting: {
        key: 'Name',
        order: 'asc'
      },
      checkedState: {
        passed: true,
        failed: true,
        pending: false
      }
    }
  }

  componentDidMount() {
    this.context.filter('', this.state.checkedState)
    this.setState(this.state) // HACK: フィルターしたレポートを強制的に再描画
  }

  setSortSetting(key: SORT_KEY, order: SORT_ORDER) {
    this.setState({
      sortSetting: { key, order }
    })
    this.context.sort(key, order)
  }

  onToggleFilter(key: EXAMPLE_STATUS) {
    const newCheckedState = {
      ...this.state.checkedState,
      [key]: !this.state.checkedState[key]
    }
    this.setState({ checkedState: newCheckedState })
    this.context.filter(this.state.searchKeyword, newCheckedState)
  }

  onChangeSearchKeyword(newKeyword: string) {
    this.setState({
      ...this.state,
      searchKeyword: newKeyword
    })
    this.context.filter(newKeyword, this.state.checkedState)
  }

  render() {
    const styles = {
      root: {
        width: '95%',
        padding: 15
      },
      resultTreeWrapper: {
        height: 'calc(100vh - 150px)',
        overflow: 'scroll',
        marginTop: 10
      }
    }
    return (
      <div style={styles.root}>
        <Grid container spacing={0}>
          <Grid item xs={6}>
            <UIResultsLeftPainFilters
              passed={this.state.checkedState.passed}
              failed={this.state.checkedState.failed}
              pending={this.state.checkedState.pending}
              onToggleFilter={key => this.onToggleFilter(key)}
            />
          </Grid>
          <Grid item xs={6}>
            <UIResultsLeftPainSearchInput
              value={this.state.searchKeyword}
              onSubmit={v => this.onChangeSearchKeyword(v)}
            />
          </Grid>
        </Grid>
        <UIResultsLeftPainSortButtons
          sortKey={this.state.sortSetting.key}
          sortOrder={this.state.sortSetting.order}
          onSubmit={(key, order) => this.setSortSetting(key, order)}
        />
        <Divider />
        <div style={styles.resultTreeWrapper}>
          <UIResultsLeftPainResultTree onSelect={this.props.onSelectExample} />
        </div>
        <Divider />
      </div>
    )
  }
}
