import { ReactNode } from "react"
import { Message, Tooltip, Whisper, toaster } from "rsuite"


export const successToast = (msg: string) => {
    toaster.push(<Message showIcon type={"success"} closable>
        {msg}
    </Message>, { placement: "bottomStart", duration: 3000 })
}
export const errorToast = (msg: string) => {
    toaster.push(<Message showIcon type={"warning"} closable>
        {msg}
    </Message>, { placement: "bottomStart", duration: 3000 })
}
export const toolTip = (msg: string, children: ReactNode, placement?: "bottomStart") => (<Whisper placement={placement} followCursor speaker={<Tooltip>{msg}</Tooltip>}>
    <div className="flex justify-center">
        {children}
    </div>
</Whisper>)

