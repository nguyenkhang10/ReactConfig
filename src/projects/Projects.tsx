import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getProjects } from "../api/projectsApi";
import "./projects.css";
import { useNavigate } from "react-router-dom";
import AppNavbar from '../components/AppNavbar';

function Projects() {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const { data: projects, isLoading, isError } =
    useQuery({
      queryKey: ["projects"],
      queryFn: getProjects,
    });


  const getInitials = (name: string) => {
    if (!name) return "TF";
    const words = name.trim().split(/\s+/);
    if (words.length === 1) return words[0].substring(0, 2).toUpperCase();
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
  };

  const filteredProjects = (projects ?? []).filter(
    (p) =>
      p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="projects-container">
      {/* Global Navigation Bar */}
      <AppNavbar />

      {/* Main Content */}
      <main className="projects-main">
        <div className="projects-header-wrapper">
          <div className="projects-title-row">
            <div className="projects-heading-group">
              <h1 className="projects-page-title">
                Dự án của bạn
                {projects && (
                  <span className="projects-count-pill">
                    {projects.length} dự án
                  </span>
                )}
              </h1>
              <p className="projects-page-subtitle">
                Quản lý và theo dõi tiến độ các khóa học &amp; dự án công việc.
              </p>
            </div>

            <button
              type="button"
              className="btn-new-project"
              onClick={() => navigate("/create-projects")}
            >
              <span>+</span> Tạo dự án mới
            </button>
          </div>

          {/* Search Toolbar */}
          <div className="projects-toolbar">
            <div className="projects-search-box">
              <span className="projects-search-icon">🔍</span>
              <input
                type="text"
                placeholder="Tìm kiếm dự án nhanh..."
                className="projects-search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              type="button"
              className="btn-new-project"
              style={{ backgroundColor: '#f1f5f9', color: '#0f172a', border: '1px solid #cbd5e1' }}
              onClick={() => navigate("/search-projects")}
            >
              <span>🔎</span> Tìm kiếm nâng cao (Status &amp; Keyword)
            </button>
          </div>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="projects-loading-grid">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="project-skeleton-card">
                <div className="skeleton-shimmer skeleton-avatar" />
                <div className="skeleton-shimmer skeleton-title" />
                <div className="skeleton-shimmer skeleton-line" />
                <div className="skeleton-shimmer skeleton-line-short" />
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="projects-empty-state">
            <div className="empty-state-icon">⚠️</div>
            <h3 className="empty-state-title">Không tải được dự án</h3>
            <p className="empty-state-desc">Vui lòng thử lại sau.</p>
          </div>
        ) : filteredProjects.length > 0 ? (
          /* Cards Grid */
          <ul className="projects-grid"></ul>
        ) : filteredProjects.length > 0 ? (
          /* Cards Grid */
          <ul className="projects-grid">
            {filteredProjects.map((project) => (
              <li key={project.id} className="project-card">
                <div>
                  <div className="project-card-top">
                    <div className="project-avatar">
                      {getInitials(project.name)}
                    </div>
                    <span className="project-status-badge">
                      <span className="project-status-dot" />
                      Hoạt động
                    </span>
                  </div>

                  <div className="project-card-body">
                    <h3 className="project-card-title">{project.name}</h3>
                    <p className="project-card-desc">{project.description}</p>
                  </div>
                </div>

                <div className="project-card-footer">
                  <span className="project-id-tag">ID: {project.id}</span>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <span
                      className="project-action-link"
                      style={{ cursor: 'pointer', color: '#10b981' }}
                      onClick={() => navigate(`/projects/${project.id}/tasks`)}
                      title="Xem danh sách nhiệm vụ"
                    >
                      🐧 Tasks
                    </span>
                    <span
                      className="project-action-link"
                      style={{ cursor: 'pointer' }}
                      onClick={() => navigate(`/get-project/${project.id}`)}
                    >
                      Chi tiết <span>→</span>
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          /* Empty State */
          <div className="projects-empty-state">
            <div className="empty-state-icon">📁</div>
            <h3 className="empty-state-title">Không tìm thấy dự án nào</h3>
            <p className="empty-state-desc">
              {searchTerm
                ? `Không có kết quả phù hợp với từ khóa "${searchTerm}". Vui lòng thử tìm kiếm khác.`
                : "Hiện chưa có dự án nào trong danh sách."}
            </p>
            {searchTerm && (
              <button
                type="button"
                className="btn-new-project"
                onClick={() => setSearchTerm("")}
              >
                Xóa bộ lọc tìm kiếm
              </button>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default Projects;