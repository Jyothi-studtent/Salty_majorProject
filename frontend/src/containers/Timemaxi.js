import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import axios from 'axios';
import './css/timemaxi.css';
import Cols from './Cols'; 
import html2canvas from 'html2canvas';
import { FiMinimize2 } from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";
import Timeline from './Timeline'; // Import your Timeline component here
import { PiExportBold } from "react-icons/pi";
import { TbArrowsMinimize } from "react-icons/tb";

const Timemaxi = ({projectId}) => {
  const svgRef = useRef();
  const containerRef = useRef();
  const containerrev = useRef(null);
  const [popup, setPopup] = useState({ visible: false, x: 0, y: 0, sprint: null });
  const [minimized, setMinimized] = useState(false);
  
  function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  }

  const months = [
    { name: 'January', days: 31 },
    { name: 'February', days: 28 },
    { name: 'March', days: 31 },
    { name: 'April', days: 30 },
    { name: 'May', days: 31 },
    { name: 'June', days: 30 },
    { name: 'July', days: 31 },
    { name: 'August', days: 31 },
    { name: 'September', days: 30 },
    { name: 'October', days: 31 },
    { name: 'November', days: 30 },
    { name: 'December', days: 31 },
  ];

  const handleMinimizeClick = () => {
    setMinimized(true); // Set minimized state to true
  };

  const handleExport = () => {
    if (containerrev.current) {
      html2canvas(containerrev.current)
        .then(canvas => {
          // Convert the captured canvas to a Data URL representing a PNG image
          const imgData = canvas.toDataURL('image/png');
  
          // Create a new image element to display the captured image
          const img = new Image();
          img.src = imgData;
  
          // Create a new window for preview
          const imageWindow = window.open('');
          
          // Write HTML content to the new window
          const content = `
            <html>
              <head>
                <title>Timeline Preview</title>
                <style>
                  body {
                    font-family: Arial, sans-serif;
                    background-color: #f0f0f0;
                    padding: 20px;
                  }
                  .image-container {
                    text-align: center;
                    margin-bottom: 20px;
                  }
                  .image-container img {
                    max-width: 100%;
                    max-height: 80vh;
                    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                  }
                  .download-button {
                    display: block;
                    text-align: center;
                    margin-top: 20px;
                  }
                  .download-button a {
                    background-color: #bd055e;
                    color: white;
                    padding: 10px 20px;
                    text-decoration: none;
                    border-radius: 5px;
                    transition: background-color 0.3s;
                  }
                  .download-button a:hover {
                    background-color: ##bd055e;
                  }
                </style>
              </head>
              <body>
                <div class="image-container">
                  <img src="${img.src}" alt="Timeline Image">
                </div>
                <div class="download-button">
                  <a href="${imgData}" download="timeline.png">Download Image</a>
                </div>
              </body>
            </html>
          `;
          
          // Write the content to the preview window
          imageWindow.document.write(content);
        })
        .catch(error => {
          console.error('Error exporting timeline:', error);
        });
    }
  };
  
  
  useEffect(() => {
    const margin = { top: 20, right: 20, bottom: 50, left: 20 };
    const svgHeight = 1000; // Height of the SVG container
    const monthRectHeight = 40; // Height of the month rectangles

    const width = 10600 - margin.left - margin.right; // Adjust the width as needed
    const height = svgHeight - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current)
      .attr('width', width + margin.left + margin.right)
      .attr('height', svgHeight); // Set SVG height

    axios.get('http://localhost:8000/djapp/sprints/', { params: { projectid: projectId } }) 
      .then(response => {
        const sprintData = response.data;
        if (Array.isArray(sprintData.sprints)) { 
          drawGanttChart(svg, width, height, sprintData.sprints, monthRectHeight); 
        } else {
          console.error('Sprint data is not an array:', sprintData);
        }
      })
      .catch(error => {
        console.error('Error fetching sprint data:', error);
      });

    d3.select(containerRef.current)
      .style('overflow-x', 'auto')
      .style('width', '100%');
  }, []);

  const drawGanttChart = (svg, width, height, sprintData, monthRectHeight) => {
    const totalDays = months.reduce((acc, month) => acc + month.days, 0);
  
    const xScale = d3.scaleLinear()
      .domain([0, totalDays])
      .range([0, width]);
  
    const monthPositions = [];
    let currentDay = 0;
    months.forEach((month, index) => {
      monthPositions.push({
        name: month.name,
        startDay: currentDay,
        endDay: currentDay + month.days,
        days: month.days,
      });
      currentDay += month.days;
    });
  
    // Draw the months
    svg.selectAll('rect.month')
      .data(monthPositions)
      .enter()
      .append('rect')
      .attr('class', 'month')
      .attr('x', d => xScale(d.startDay))
      .attr('y', 0) // Position at the top
      .attr('width', d => xScale(d.endDay) - xScale(d.startDay))
      .attr('height', monthRectHeight) // Set height to monthRectHeight
      .attr('fill', (d, i) => (i % 2 === 0 ? '#e0e0e0' : '#c0c0c0'));
  
    // Add month labels
    svg.selectAll('text.month-label')
      .data(monthPositions)
      .enter()
      .append('text')
      .attr('class', 'month-label')
      .attr('x', d => xScale((d.startDay + d.endDay) / 2))
      .attr('y', monthRectHeight - 15) // Adjusted position
      .attr('text-anchor', 'middle')
      .style('font-size', '18px')
      .style('font-weight', 'bold')
      .text(d => d.name);
  
    // Add day labels
    monthPositions.forEach(month => {
      const daysArray = d3.range(month.days);
      svg.selectAll(`g.day-group-${month.name}`)
        .data(daysArray)
        .enter()
        .append('g')
        .attr('class', `day-group day-group-${month.name}`)
        .attr('transform', (d, i) => `translate(${xScale(month.startDay + d) + xScale(0.5)}, ${monthRectHeight + 20})`)
        .each(function (d, i) {
          const boxSize = 20; // Adjust the size of the box as needed
          const borderRadius = 3; // Adjust the border radius as needed
          d3.select(this)
            .append('rect')
            .attr('class', 'day-box')
            .attr('x', -boxSize / 2) // Adjust spacing as needed
            .attr('y', -boxSize / 1.4) // Adjust spacing as needed
            .attr('width', boxSize) // Adjust width as needed
            .attr('height', boxSize) // Adjust height as needed
            .attr('rx', borderRadius) // Set the border radius for x-axis
            .attr('ry', borderRadius) // Set the border radius for y-axis
            .style('fill', 'none') // Remove background color
            .style('stroke', 'lightgrey') // Set border color (change to desired color)
            .style('stroke-width', 1) // Set border width (adjust as needed);
  
          d3.select(this)
            .append('text')
            .attr('class', `day-label day-label-${month.name}`)
            .attr('text-anchor', 'middle')
            .attr('fill', '#000') // Set the fill color to black
            .style('font-weight', 'bold')
            .text(i + 1);
        });
    });
  
    // Draw vertical lines after every 7 days
    const dayInterval = 7;
    for (let i = dayInterval; i < totalDays; i += dayInterval) {
      svg.append('line')
        .attr('x1', xScale(i))
        .attr('y1', 50)
        .attr('x2', xScale(i))
        .attr('y2', height)
        .attr('stroke', '#ddd')
        .attr('stroke-width', 1);
    }
  
    // Map over sprintData array
    sprintData.forEach((sprint, index) => {
      if (sprint.end_date && sprint.start_date) {
        const startDate = new Date(sprint.start_date);
        const endDate = new Date(sprint.end_date);
  
        const startMonth = startDate.toLocaleString('default', { month: 'long' });
        const startDay = startDate.getDate();
  
        const endMonth = endDate.toLocaleString('default', { month: 'long' });
        const endDay = endDate.getDate();
  
        const monthMap = {
          "January": 0, "February": 1, "March": 2, "April": 3, "May": 4, "June": 5,
          "July": 6, "August": 7, "September": 8, "October": 9, "November": 10, "December": 11
        };
  
        const MonthStart = monthPositions[monthMap[startMonth]].startDay + (startDay - 1);
        const MonthEnd = monthPositions[monthMap[endMonth]].startDay + (endDay - 1);
        const highlightWidth = xScale(MonthEnd + 1) - xScale(MonthStart);
  
        let highlightColor = '';
        const closedColor = 'rgba(255,132,132)'; // light grey
        const futureColor = 'rgba(167, 199, 231)'; // peach pink
        const activeColor = 'rgba(152, 251, 152, 0.3)'; // peach green
  
        if (sprint.status === 'completed') {
          highlightColor = closedColor;
        } else if (sprint.status === 'start') {
          highlightColor = futureColor; // Change to futureColor for status 'start'
        } else {
          highlightColor = activeColor;
        }
  
        const sprintGroup = svg.append('g')
          .attr('class', 'sprint-group')
          .attr('transform', `translate(${xScale(MonthStart)}, ${100 + index * (monthRectHeight + 10)})`)
          .on('click', function (event) {
            event.stopPropagation();
            const [x, y] = d3.pointer(event);
            const sprintWidth = xScale(MonthEnd + 1) - xScale(MonthStart);
            const offsetX = sprintWidth / 2; // Adjust this value as needed
            const popupLeft = x - containerRef.current.getBoundingClientRect().left - offsetX + 'px';
  
            setPopup({
              visible: true,
              x: x,
              y: 100 + index * (monthRectHeight + 10) + monthRectHeight + 10, // Adjust y position to be below the sprint
              sprint
            });
          });
  
        sprintGroup.append('rect')
          .attr('width', highlightWidth)
          .attr('height', monthRectHeight - 15)
          .attr('fill', highlightColor);
  
        // Add sprint name in the middle of the highlighted sprint
        sprintGroup.append('foreignObject')
          .attr('width', highlightWidth)
          .attr('height', monthRectHeight - 15)
          .append('xhtml:div')
          .style('width', '100%')
          .style('height', '100%')
          .style('display', 'flex')
          .style('align-items', 'center')
          .style('justify-content', 'center')
          .style('overflow', 'hidden')
          .style('text-overflow', 'ellipsis')
          .style('white-space', 'nowrap')
          .style('font-size', '11.5px')
          .style('font-weight', 'bold')
          .style('color', '#000') // Set text color
          .text(sprint.sprint);
  
        const today = new Date();
        const todayMonth = today.toLocaleString('default', { month: 'long' });
        const todayDay = today.getDate();
        const todayPosition = monthPositions[monthMap[todayMonth]].startDay + (todayDay - 1);
        const todayXPosition = xScale(todayPosition) + (xScale(1) / 2);
  
        const currentDaySVG = svg.append('line')
          .attr('x1', todayXPosition)
          .attr('y1', monthRectHeight + 45) // Adjusted y position to be below the month rectangles
          .attr('x2', todayXPosition)
          .attr('y2', height)
          .attr('stroke', 'red')
          .attr('stroke-width', 2)
          .node(); // Get the DOM node of the current date SVG element
  
        const currentDayTextSVG = svg.append('text')
          .attr('x', todayXPosition)
          .attr('y', monthRectHeight + 38) // Adjusted y position to be below the line
          .attr('text-anchor', 'middle')
          .style('font-size', '11px')
          .style('font-weight', 'bold')
          .attr('fill', 'red')
          .text("Current day")
          .node();
  
                  currentDaySVG.scrollIntoView({
            behavior: 'smooth',
            block: 'center', // Scroll to the top of the viewport
            inline: 'center' // Scroll to the left of the viewport
          });
          
          currentDayTextSVG.scrollIntoView({
            behavior: 'smooth',
            block: 'center', // Scroll to the top of the viewport
            inline: 'center' // Scroll to the left of the viewport
          });
        window.addEventListener('click', (event) => {
          const popupElement = document.querySelector('.popuptime');
          if (popupElement && !popupElement.contains(event.target)) {
            setPopup({ visible: false, x: 0, y: 0, sprint: null });
          }
        });
  
      }
    });
  };

  return (
    minimized ? (
      <Timeline projectId={projectId} setMinimized={setMinimized} />
    ) : (
      <div ref={containerrev}>
        <div className="forflex"ref={containerRef}>
          <div className='colsprint'>
            <TbArrowsMinimize className='mini' onClick={handleMinimizeClick} />
            <button onClick={handleExport} className="export-button-maxi"> <PiExportBold /> Export  </button>
            <Cols projectId={projectId}/> 
          </div>
          <div style={{ overflowX: 'auto', width: '100%', marginTop: '55px' }}>
            <svg  ref={svgRef}></svg>
            {popup.visible && (
              <div className="popuptime centered-popup">
                <div className="sprint-info">
                  <p><strong>{popup.sprint.sprint}</strong></p>
                  <p className={
                    popup.sprint.status === 'start' ? 'future-sprint' :
                    popup.sprint.status === 'complete' ? 'active-sprint' :
                    'closed-sprint'
                  }>
                    {popup.sprint.status === 'start' && 'Future sprint'}
                    {popup.sprint.status === 'complete' && 'Active sprint'}
                    {popup.sprint.status === 'completed' && 'Closed sprint'}
                  </p>
                </div>
                <p>Start Date: {formatDate(popup.sprint.start_date)}</p>
                <p>End Date: {formatDate(popup.sprint.end_date)}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  );
};

export default Timemaxi;
