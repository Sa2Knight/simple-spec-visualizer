import React from 'react'
import { Grid } from '@material-ui/core'
import UIResultsLeftPain from './UIResultsLeftPain'
import UIResultsRightPain from './UIResultsRightPain'
import UIResultsScreenshotDialog from './UIResultsScreenshotDialog'
import ReportContext from '../../context/report'
import Example from '../../models/example'

type Props = {}
type State = {
  selectedExample: Example | null
  isShowDialog: boolean
}
export default class UIResults extends React.Component<Props, State> {
  static contextType = ReportContext

  constructor(props: Props) {
    super(props)
    this.state = {
      selectedExample: null,
      isShowDialog: false
    }
  }

  componentWillMount() {
    this.setState({ selectedExample: this.context.firstExample() })
  }

  setSelectedExample(selectedExample: Example) {
    this.setState({ selectedExample })
  }

  showDialog() {
    this.setState({ isShowDialog: true })
  }

  hideDialog() {
    this.setState({ isShowDialog: false })
  }

  render() {
    const { selectedExample } = this.state
    if (!selectedExample) return

    return (
      <div>
        <Grid container spacing={0}>
          <Grid item xs={6}>
            <UIResultsLeftPain onSelectExample={example => this.setSelectedExample(example)} />
          </Grid>
          <Grid item xs={6}>
            <UIResultsRightPain
              example={selectedExample}
              locationUrl={this.context.getLocationUrl(selectedExample.location)}
              onClickImage={() => this.showDialog()}
            />
          </Grid>
        </Grid>
        <UIResultsScreenshotDialog
          open={this.state.isShowDialog}
          example={selectedExample}
          onClose={() => this.hideDialog()}
        />
      </div>
    )
  }
}
