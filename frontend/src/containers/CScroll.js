import React from 'react'
import './CScroll.css';
const CScroll =(props)=>{
    return (
        <div className="c-div" style={{overflowY:'scroll', border:'none', height:'80vh', scrollbarWidth: '1rem', borderRadius:'10px'}}>
            {props.children}
        </div>
    )
}
export default CScroll;