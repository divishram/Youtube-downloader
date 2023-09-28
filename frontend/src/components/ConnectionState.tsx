import React from "react";

function Status({props} : {props: Boolean}) {
    return (
        <p>
            Connection status: {props.toString()}
        </p>
    )
}

export default Status;