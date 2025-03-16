import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import './css/sidebar.css';
import { FaTimeline } from "react-icons/fa6";
import { BsStack } from "react-icons/bs";
import { HiViewBoards } from "react-icons/hi";
import { IoList } from "react-icons/io5";
import { GoIssueClosed } from "react-icons/go";
import { BiSolidPieChartAlt2 } from "react-icons/bi";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { group_id, projectid } = useParams(); // Extract group_id and projectid from URL
  const navigate = useNavigate();

  const navigateTo = (path) => {
    navigate(`/group/${group_id}/project/${projectid}${path}`);
  };

  return (
    <section
      className="page sidebar-3-page"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <aside className={`sidebar-3 ${isOpen ? 'open' : ''}`}>
        <div className="inner">
          <header>
            <div className="project-id">
              {isOpen ? <p>{projectid}</p> : <></>}
            </div>
          </header>
          <nav>
            <button type="button" onClick={() => navigateTo("/time")}>
              <FaTimeline />
              {isOpen && <p>Timeline</p>}
            </button>
            <button type="button" onClick={() => navigateTo("/backlog")}>
              <BsStack />
              {isOpen && <p>Backlogs</p>}
            </button>
            <button type="button" onClick={() => navigateTo("/boards")}>
              <HiViewBoards />
              {isOpen && <p>Boards</p>}
            </button>
            <button type="button" onClick={() => navigateTo("/filters")}>
              <IoList />
              {isOpen && <p>Filters</p>}
            </button>
            <button type="button" onClick={() => navigateTo("/myissues")}>
              <GoIssueClosed />
              {isOpen && <p>My Issues</p>}
            </button>
            <button type="button" onClick={() => navigateTo("/contributions")}>
              <BiSolidPieChartAlt2 />
              {isOpen && <p>Reports</p>}
            </button>
          </nav>
        </div>
      </aside>
    </section>
  );
};

export default Sidebar;
