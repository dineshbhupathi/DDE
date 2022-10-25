import React, { useEffect, useState } from "react";
import MuiAlert from '@mui/material/Alert';
import { Snackbar } from "@mui/material";
import { Stack, width } from '@mui/system';

const Alert = React.forwardRef(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
})

export default function DefaultError(props) {

    const [open, setOpen] = useState(true)
    const { data } = props
    console.log(data.length)
    const handleClose = () => {
        setOpen(false)
    }

    return (
        <Stack spacing={2} sx={{ width: "100%" }}>
            <Snackbar
                open={open}
                autoHideDuration={6000}
                onClose={handleClose}
            >
                <Alert onClose={handleClose}
                    severity="error"
                    sx={{ with: "100%" }}
                >{data && (
                    <div>{data}</div>
                )}
                {!data && (
                    <div>Error Occured. something went wrong.</div>
                )}
                

                </Alert>
            </Snackbar>
        </Stack>
    )

}