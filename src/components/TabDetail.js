import React from 'react'
import Grid from '@material-ui/core/Grid'
import DetailLeftPain from './DetailLeftPain'
import DetailRightPain from './DetailRightPain'
import ScreenshotDialog from './ScreenshotDialog'

export default class Detail extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      selectedExample: this.props.report.firstExample(),
      isShowDialog: false
    }
    console.log(this.state)
  }

  setSelectedExample(selectedExample) {
    this.setState({ selectedExample })
  }

  showDialog() {
    this.setState({ isShowDialog: true })
  }

  hideDialog() {
    this.setState({ isShowDialog: false })
  }

  render() {
    return (
      <div>
        <Grid container spacing={2}>
          <Grid container item xs={5} alignContent="flex-start">
            <DetailLeftPain report={this.props.report} onSelectExample={example => this.setSelectedExample(example)} />
          </Grid>
          <Grid item xs={7}>
            <DetailRightPain example={this.state.selectedExample} onClickImage={() => this.showDialog()} />
          </Grid>
        </Grid>
        <ScreenshotDialog
          open={this.state.isShowDialog}
          example={this.state.selectedExample}
          onClose={() => this.hideDialog()}
        />
      </div>
    )
  }
}
