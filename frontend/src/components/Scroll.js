import React from 'react'
import './ScrollStyle.css'
const Scroll =(props)=>{
    return (
        <div style={{overflowY:'scroll', border:'none', height:'80vh', scrollbarWidth: 'none', borderRadius:'10px'}}>
            {props.children}
        </div>
    )
}
export default Scroll;