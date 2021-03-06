import React from 'react'
import { Table, TableBody, TableCell, TableContainer, TableRow, Paper } from '@material-ui/core'
import AssignmentIcon from '@material-ui/icons/Assignment'
import Example from '../../models/example'
import Snackbar from '@material-ui/core/Snackbar'

const LocationLink = (props: { location: string; url: string }) => {
  if (props.location && props.url) {
    return (
      <a href={props.url} target="_blank" rel="noopener noreferrer">
        {props.location}
      </a>
    )
  } else if (props.location) {
    return <span>{props.location}</span>
  } else {
    return <span>-</span>
  }
}

const CopyLocationIcon = (props: { location: string }) => {
  const [showSnackbar, setShowSnackbar] = React.useState(false)
  return (
    <span
      style={{ cursor: 'pointer' }}
      onClick={() => {
        navigator.clipboard.writeText(props.location)
        setShowSnackbar(true)
      }}
    >
      <AssignmentIcon />
      <Snackbar
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right'
        }}
        open={showSnackbar}
        autoHideDuration={1500}
        onClose={() => setShowSnackbar(false)}
        message="Source location have been copied."
      />
    </span>
  )
}

/**
 * Exampleの結果をテーブル描画するコンポーネント
 */
export default function (props: { example: Example; locationUrl: string; onClickImage: () => void }) {
  const { expectation, exception, filePathWithLineNumber, imageUrl, status } = props.example
  const descriptions = props.example.getAllNames()
  const styles = {
    root: {
      height: window.innerHeight - 20, // FIXME: ゴリ押し辞めたいね
      overflow: 'scroll'
    }
  }

  return (
    <div style={styles.root}>
      <TableContainer component={Paper}>
        <Table>
          <TableBody>
            <TableRow>
              <TableCell>Descriptions</TableCell>
              <TableCell>
                {descriptions.map((d, i) => (
                  <p key={i} style={{ lineHeight: 0.75 }}>
                    {d}
                  </p>
                ))}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Expectation</TableCell>
              <TableCell>{expectation}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Source</TableCell>
              <TableCell>
                <LocationLink location={filePathWithLineNumber} url={props.locationUrl} />
                <CopyLocationIcon location={filePathWithLineNumber} />
              </TableCell>
            </TableRow>
            {exception ? (
              <TableRow>
                <TableCell>Exception</TableCell>
                <TableCell>{exception}</TableCell>
              </TableRow>
            ) : null}
            {imageUrl && status !== 'pending' ? (
              <TableRow>
                <TableCell
                  colSpan={2}
                  style={{ textAlign: 'center', cursor: 'pointer' }}
                  onClick={() => props.onClickImage()}
                >
                  <img
                    style={{ border: '1px solid', maxWidth: '100%', maxHeight: '600px', objectFit: 'contain' }}
                    src={imageUrl}
                    alt={expectation}
                  ></img>
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  )
}
