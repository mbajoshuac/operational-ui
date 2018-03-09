import * as React from "react"
import glamorous from "glamorous"
import { Theme } from "@operational/theme"
import { render } from "react-dom"
import { injectStylesheet, baseStylesheet } from "@operational/utils"

import { OperationalUI, operationalTheme, Input, Record, RecordHeader, RecordBody, Card, Heading1Type } from "../../src/index"

interface IState {
  isOpen: boolean
}

const Records = glamorous.div(({ theme }: { theme: Theme }): {} => ({
  "& > *": {
    marginTop: -1
  }
}))

class Site extends React.Component<{}, IState> {
  state = {
    isOpen: false
  }
  render() {
    return (
      <OperationalUI withBaseStyles>
        <div style={{ margin: 20 }}>
          <Card>
            <Input value="1234" label="Apple pie!" onChange={(v) => {console.log(v)}}/>
          </Card>
        </div>
      </OperationalUI>
    )
  }
}

render(<Site />, document.getElementById("app"))
