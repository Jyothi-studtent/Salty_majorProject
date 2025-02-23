import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import './css/sidebar.css';
import { FaTimeline } from "react-icons/fa6";
import { BsStack } from "react-icons/bs";
import { HiViewBoards } from "react-icons/hi";
import { IoList } from "react-icons/io5";
import { GoIssueClosed } from "react-icons/go";
import { BiSolidPieChartAlt2 } from "react-icons/bi";
import { RxHamburgerMenu } from "react-icons/rx";
import { MdClose } from "react-icons/md";
import { useSelector } from 'react-redux';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { projectid } = useParams();
  const navigate = useNavigate();

  const navigateTo = (path) => {
    navigate(path);
  };
  // const projectName=useSelector(state => state.auth.project.projectname);
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
            {(isOpen)?<p>{projectid}</p>:<></>}
           
          </div>
          </header>
          <nav>
            <button type="button" onClick={() => navigateTo(`/project/${projectid}/time`)}>
              <FaTimeline />
              {isOpen && <p>Timeline</p>}
            </button>
            <button type="button" onClick={() => navigateTo(`/project/${projectid}/backlog`)}>
              <BsStack />
              {isOpen && <p>Backlogs</p>}
            </button>
            <button type="button" onClick={() => navigateTo(`/project/${projectid}/boards`)}>
              <HiViewBoards />
              {isOpen && <p>Boards</p>}
            </button>
            <button type="button" onClick={() => navigateTo(`/project/${projectid}/filters`)}>
              <IoList />
              {isOpen && <p>Filters</p>}
            </button>
            <button type="button" onClick={() => navigateTo(`/project/${projectid}/myissues`)}>
              <GoIssueClosed />
              {isOpen && <p>My Issues</p>}
            </button>
            <button type="button" onClick={() => navigateTo(`/project/${projectid}/contributions`)}>
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




