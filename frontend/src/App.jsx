import React, { useState } from 'react';

// Mock Data matching the exact screens designed by Vy
const initialDocuments = [
  {
    id: "DOC-102",
    name: "API_Endpoints.md",
    repository: "livingdocs-backend",
    severity: "CRITICAL",
    date: "2026-08-21",
    oldContent: [
      "1. # API Endpoints Guide",
      "2. This document details core API endpoints of the service.",
      "3. ",
      "4. ## User Retrieval",
      "5. * **Endpoint**: GET /api/v1/users",
      "6. * **Description**: Returns active users in the system.",
      "7. * **Parameters**: None",
      "8. * **Response Format**: List of User Objects"
    ],
    newContent: [
      "1. # API Endpoints Guide",
      "2. This document details core API endpoints of the service.",
      "3. ",
      "4. ## User Retrieval (Updated for Pagination)",
      "5. * **Endpoint**: GET /api/v1/users",
      "6. * **Description**: Returns paginated list of active users.",
      "7. * **Parameters**: [Added]",
      "8. *   - **page** (int): Current page index (default: 0)",
      "9. *   - **size** (int): Page elements size (default: 20)"
    ],
    evidence: {
      repo: "livingdocs-backend",
      commit: "#abc123d",
      trigger: "UserController.java (Lines 45-62)",
      diff: "Added page/size request params",
      template: "Standard API Template",
      ticket: "[JIRA-402] Implement User List Pagination",
      confidence: "96% (Verified by AST Semantic Analysis)"
    }
  },
  {
    id: "DOC-101",
    name: "README.md",
    repository: "livingdocs-web",
    severity: "HIGH",
    date: "2026-08-20",
    oldContent: [
      "1. # LivingDocs Web",
      "2. This is the frontend react application for LivingDocs.",
      "3. To run, use: npm run dev"
    ],
    newContent: [
      "1. # LivingDocs Web Portal",
      "2. This is the frontend react application for LivingDocs.",
      "3. To run, use: npm run dev",
      "4. Added support for Review Queue Dashboard and Workspace widgets."
    ],
    evidence: {
      repo: "livingdocs-web",
      commit: "#def456e",
      trigger: "App.jsx (Lines 10-35)",
      diff: "Added route /review-queue and navigation links",
      template: "Project README Template",
      ticket: "[JIRA-403] Add Review Queue UI Elements",
      confidence: "92% (Semantic Match)"
    }
  },
  {
    id: "DOC-103",
    name: "UserController.java",
    repository: "auth-service",
    severity: "MEDIUM",
    date: "2026-08-19",
    oldContent: [
      "1. package com.livingdocs.auth;",
      "2. public class UserController {",
      "3.   // Default auth endpoints",
      "4. }"
    ],
    newContent: [
      "1. package com.livingdocs.auth;",
      "2. @RestController",
      "3. public class UserController {",
      "4.   // Added JWT validation integration check",
      "5. }"
    ],
    evidence: {
      repo: "auth-service",
      commit: "#auth789x",
      trigger: "AuthController.java (Lines 15-30)",
      diff: "Migrated authentication checks to SecurityFilter",
      template: "Java REST Controller Doc Template",
      ticket: "[JIRA-404] Upgrade JWT Authentication Layer",
      confidence: "88% (Verified by AST)"
    }
  },
  {
    id: "DOC-112",
    name: "Config_Guide.pdf",
    repository: "core-infra",
    severity: "LOW",
    date: "2026-08-18",
    oldContent: [
      "1. # Server Configuration Guide",
      "2. Default setup with single instance DB."
    ],
    newContent: [
      "1. # Server Configuration Guide",
      "2. Configured for High Availability with Redis Cache.",
      "3. Added fallback strategies."
    ],
    evidence: {
      repo: "core-infra",
      commit: "#cfg112y",
      trigger: "application.yaml (Lines 8-14)",
      diff: "Added connection pool sizes and caching thresholds",
      template: "System Configuration Template",
      ticket: "[JIRA-408] Integrate Redis Caching Layer",
      confidence: "95% (OCR Semantic Match)"
    }
  },
  {
    id: "DOC-113",
    name: "Deployment.md",
    repository: "core-infra",
    severity: "LOW",
    date: "2026-08-17",
    oldContent: [
      "1. # Docker Deployment",
      "2. Run with command: docker-compose up"
    ],
    newContent: [
      "1. # Docker & K8s Deployment Guide",
      "2. Run with command: docker-compose up",
      "3. Added Kubernetes charts in /helm directory."
    ],
    evidence: {
      repo: "core-infra",
      commit: "#k8s334z",
      trigger: "k8s-deployment.yaml (Lines 1-25)",
      diff: "Added replica set definition and resource constraints",
      template: "Deployment Guide Template",
      ticket: "[JIRA-409] Kubernetes Orchestration Setup",
      confidence: "90% (Semantic Match)"
    }
  }
];

export default function LivingDocsApp() {
  const [screen, setScreen] = useState('dashboard'); // 'dashboard' or 'workspace'
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [documents, setDocuments] = useState(initialDocuments);
  const [auditTrails, setAuditTrails] = useState([
  { id: 1, documentId: "#DOC-102", action: "STAFF APPROVED", actorRole: "STAFF", timestamp: "2026-08-29 09:15:22", feedback: "Tài liệu khớp với code thay đổi, cấu trúc chuẩn theo mẫu API." },
  { id: 2, documentId: "#DOC-101", action: "REJECTED", actorRole: "STAFF", timestamp: "2026-08-28 14:20:10", feedback: "Vui lòng cập nhật thêm hướng dẫn cấu hình Redis." }
]);
  const [feedback, setFeedback] = useState('');
  const [notification, setNotification] = useState(null);

  // Filter States
  const [repoFilter, setRepoFilter] = useState('All');
  const [severityFilter, setSeverityFilter] = useState('All');
React.useEffect(() => {
  console.log("Đang gọi API tới Backend của Minh...");
  // 1. Gọi API lấy danh sách tài liệu
  fetch('http://localhost:8080/api/documents')
    .then(response => response.json())
    .then(data => {
      const mappedData = data.map(doc => ({
        id: doc.id,
        name: doc.name,
        repository: doc.repository,
        severity: doc.severity,
        date: doc.submissionDate || "2026-08-21",
        oldContent: typeof doc.oldContent === 'string' ? doc.oldContent.split('\n') : [],
        newContent: typeof doc.newContent === 'string' ? doc.newContent.split('\n') : [],
        evidence: {
          repo: doc.repository,
          commit: doc.commitHash || "#abc123d",
          trigger: doc.triggerSource || "UserController.java (Lines 45-62)",
          diff: doc.diffAnalyzed || "Added page/size request params",
          template: doc.targetTemplate || "Standard API Template",
          ticket: doc.associatedTicket || "[JIRA-402]",
          confidence: doc.confidenceScore || "96%"
        }
      }));
      setDocuments(mappedData);
    })
    .catch(err => console.warn("Backend documents đang offline, dùng dữ liệu giả lập.", err));

  // 2. Gọi API lấy danh sách Nhật ký kiểm toán (Audit Trail)
  fetch('http://localhost:8080/api/audit-trails')
    .then(response => {
      if (response.ok) return response.json();
      throw new Error("Lỗi tải audit-trails");
    })
    .then(data => setAuditTrails(data))
    .catch(err => console.warn("Backend audit-trails đang offline, dùng dữ liệu giả lập.", err));
}, []);
  // =========================================================================

// Phía dưới này là các hàm showNotification, handleOpenReview...

const showNotification = (message, type = 'success') => {
  setNotification({ message, type });
  setTimeout(() => setNotification(null), 4000);
};

const handleOpenReview = (doc) => {
  setSelectedDoc(doc);
  setFeedback('');
  setScreen('workspace');
};

const handleApprove = async(docId)=>{

    try{

        const response = await fetch(
            `http://localhost:8080/api/documents/${docId}/approve`,
            {
                method:"DELETE"
            }
        );

        if(!response.ok)
            throw new Error();

        setDocuments(prev=>prev.filter(d=>d.id!==docId));
        setScreen("dashboard");

        showNotification(
            `Staff đã duyệt ${docId}!`,
            "success"
        );

    }catch(err){

        showNotification(
            "Không kết nối được Backend!",
            "error"
        );
    }
}

const handleReject = async (docId) => {
  if (!feedback.trim()) {
    showNotification('Vui lòng nhập lý do từ chối (Feedback) trước khi Reject!', 'error');
    return;
  }
  try {
    console.log(`Đang gọi API từ chối tài liệu: ${docId}`);
    const response = await fetch(`http://localhost:8080/api/documents/${docId}/reject`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ feedback: feedback })
    });

    if (!response.ok) throw new Error("Lỗi kết nối API");

    setDocuments(prev => prev.filter(d => d.id !== docId));
    setScreen("dashboard");
    showNotification(`Đã từ chối tài liệu ${docId} và chuyển phản hồi về cho Developer thành công!`, "warning");
  } catch (err) {
    console.warn("Chưa cấu hình API Reject thật hoặc Backend offline, kích hoạt chế độ Demo dự phòng:", err);
    setDocuments(prev => prev.filter(d => d.id !== docId));
    setScreen("dashboard");
    showNotification(`[Demo Mode] Đã từ chối tài liệu ${docId}. Phản hồi đã gửi về cho Developer.`, "warning");
  }
};

  // Filter logic
  const filteredDocs = documents.filter(doc => {
    const matchRepo = repoFilter === 'All' || doc.repository === repoFilter;
    const matchSeverity = severityFilter === 'All' || doc.severity === severityFilter;
    return matchRepo && matchSeverity;
  });

  return (
    <div className="min-h-screen bg-[#0d0e12] text-[#e3e4e8] font-sans antialiased">
      {/* GLOBAL HEADER */}
      <header className="border-b border-[#21232d] bg-[#12131a] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className="text-[#39ff14] font-bold text-xl tracking-wider">LIVINGDOCS</span>
          <span className="text-[#646a80] text-sm font-medium">| AI-Assisted Documentation System</span>
        </div>
        
        <div className="flex items-center space-x-4">
          <input 
            type="text" 
            placeholder="Search documentation..." 
            className="bg-[#1b1c24] border border-[#2c2f3d] rounded-lg px-4 py-1.5 text-sm text-[#e3e4e8] placeholder-[#535970] focus:outline-none focus:border-[#39ff14] transition-all w-64"
          />
          <div className="flex items-center bg-[#1b1c24] border border-[#2c2f3d] rounded-lg px-4 py-1.5 text-xs text-[#e3e4e8]">
            <span className="w-2 h-2 rounded-full bg-[#39ff14] mr-2 animate-pulse"></span>
            <span className="font-semibold">Staff: Bui Nguyen Yen Vy (Reviewer)</span>
          </div>
        </div>
      </header>

      {/* NOTIFICATION TOAST */}
      {notification && (
        <div className={`fixed top-5 right-5 z-50 flex items-center p-4 rounded-lg shadow-lg border text-sm max-w-md animate-bounce ${
          notification.type === 'success' ? 'bg-[#153e1b] border-[#39ff14] text-[#aefca2]' :
          notification.type === 'warning' ? 'bg-[#3e2e15] border-[#ffa500] text-[#fcdca2]' :
          'bg-[#3e1515] border-[#ff4d4d] text-[#fca2a2]'
        }`}>
          <span className="font-bold mr-2">{notification.type === 'success' ? '✓' : '⚠'}</span>
          {notification.message}
        </div>
      )}

      {/* MAIN CONTAINER */}
      <main className="max-w-[1400px] mx-auto p-6">
        
        {/* SCREEN 1: REVIEW QUEUE DASHBOARD */}
        {screen === 'dashboard' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-extrabold text-[#f3f4f6]">Review Queue (Hàng đợi kiểm duyệt)</h1>
              <p className="text-[#848c9e] text-sm mt-1">Manage and verify AI-generated & auto-updated documentation updates</p>
            </div>

            {/* FILTERS PANEL */}
            <div className="bg-[#12131a] border border-[#21232d] rounded-xl p-4 flex flex-wrap gap-4 items-center">
              <span className="text-[#39ff14] font-semibold text-sm">Filters:</span>
              
              {/* Repo Filter */}
              <div className="flex flex-col">
                <select 
                  value={repoFilter} 
                  onChange={(e) => setRepoFilter(e.target.value)}
                  className="bg-[#1b1c24] border border-[#2c2f3d] rounded-lg px-3 py-1.5 text-xs font-medium text-[#c5c9d6] focus:outline-none focus:border-[#39ff14]"
                >
                  <option value="All">Repository: All</option>
                  <option value="livingdocs-backend">livingdocs-backend</option>
                  <option value="livingdocs-web">livingdocs-web</option>
                  <option value="auth-service">auth-service</option>
                  <option value="core-infra">core-infra</option>
                </select>
              </div>

              {/* Severity Filter */}
              <div className="flex flex-col">
                <select 
                  value={severityFilter} 
                  onChange={(e) => setSeverityFilter(e.target.value)}
                  className="bg-[#1b1c24] border border-[#2c2f3d] rounded-lg px-3 py-1.5 text-xs font-medium text-[#c5c9d6] focus:outline-none focus:border-[#39ff14]"
                >
                  <option value="All">Drift Severity: All</option>
                  <option value="CRITICAL">CRITICAL 🚨</option>
                  <option value="HIGH">HIGH 🟠</option>
                  <option value="MEDIUM">MEDIUM 🟡</option>
                  <option value="LOW">LOW 🟢</option>
                </select>
              </div>

              <div className="ml-auto">
                <select className="bg-[#1b1c24] border border-[#2c2f3d] rounded-lg px-3 py-1.5 text-xs font-medium text-[#c5c9d6] focus:outline-none">
                  <option>Sort By: Submission Date ▽</option>
                  <option>Sort By: Severity (High to Low)</option>
                </select>
              </div>
            </div>

            {/* DOCUMENTS TABLE */}
            <div className="bg-[#12131a] border border-[#21232d] rounded-xl overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#21232d] bg-[#161722] text-[#848c9e] text-xs uppercase font-bold tracking-wider">
                    <th className="py-4 px-6">ID</th>
                    <th className="py-4 px-6">Document Name</th>
                    <th className="py-4 px-6">Repository</th>
                    <th className="py-4 px-6">Drift Severity</th>
                    <th className="py-4 px-6">Submission Date</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#21232d] text-sm">
                  {filteredDocs.length > 0 ? (
                    filteredDocs.map((doc) => (
                      <tr key={doc.id} className="hover:bg-[#161722]/50 transition-colors">
                        <td className="py-4 px-6 font-mono text-[#39ff14]">{doc.id}</td>
                        <td className="py-4 px-6 font-semibold text-[#f3f4f6]">{doc.name}</td>
                        <td className="py-4 px-6 text-[#9ca3af]">{doc.repository}</td>
                        <td className="py-4 px-6">
                          <span className={`inline-flex px-2.5 py-1 rounded text-xs font-extrabold tracking-wide border ${
                            doc.severity === 'CRITICAL' ? 'bg-[#3d1a1a] text-[#ff4a4a] border-[#6b1e1e]' :
                            doc.severity === 'HIGH' ? 'bg-[#3d2a1a] text-[#ff984a] border-[#6b471e]' :
                            doc.severity === 'MEDIUM' ? 'bg-[#393d1a] text-[#e6c34a] border-[#646b1e]' :
                            'bg-[#1a3d24] text-[#4aff73] border-[#1e6b36]'
                          }`}>
                            {doc.severity} {doc.severity === 'CRITICAL' ? '🚨' : ''}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-[#848c9e]">{doc.date}</td>
                        <td className="py-4 px-6 text-right">
                          <button 
                            onClick={() => handleOpenReview(doc)}
                            className="bg-[#ec4899] hover:bg-[#db2777] text-white font-semibold text-xs px-4 py-1.5 rounded-lg shadow-sm hover:shadow-md transition-all active:scale-95"
                          >
                            🔍 Review
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="py-8 text-center text-[#646a80] italic">
                        Không tìm thấy tài liệu nào khớp với bộ lọc của Vy!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* PAGINATION */}
            <div className="flex justify-center items-center space-x-3 text-xs text-[#848c9e]">
              <button className="px-3 py-1 rounded bg-[#161722] border border-[#21232d] disabled:opacity-50 hover:bg-[#1b1c24] transition-all" disabled>◀</button>
              <span className="font-semibold text-[#f3f4f6]">Page 1 of 3</span>
              <button className="px-3 py-1 rounded bg-[#161722] border border-[#21232d] hover:bg-[#1b1c24] transition-all">▶</button>
            </div>
            {/* AUDIT TRAIL HISTORY PANEL */}
            <div className="mt-12 space-y-4">
              <div>
                <h2 className="text-xl font-bold text-[#39ff14] flex items-center">
                  <span className="w-2.5 h-2.5 bg-[#39ff14] rounded-full mr-2 animate-pulse"></span>
                  Audit Trail History (Nhật ký kiểm toán hệ thống)
                </h2>
                <p className="text-[#848c9e] text-xs mt-1">Lịch sử ghi vết toàn bộ hành động kiểm duyệt của AI, Staff và Manager</p>
              </div>

              <div className="bg-[#12131a] border border-[#21232d] rounded-xl overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#21232d] bg-[#161722] text-[#848c9e] text-xs uppercase font-bold tracking-wider">
                      <th className="py-3 px-6">ID Tài liệu</th>
                      <th className="py-3 px-6">Người thực hiện</th>
                      <th className="py-3 px-6">Hành động</th>
                      <th className="py-3 px-6">Thời gian</th>
                      <th className="py-3 px-6">Ý kiến phản hồi (Feedback)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#21232d] text-xs font-mono">
                    {auditTrails.map((trail) => (
                      <tr key={trail.id} className="hover:bg-[#161722]/30 transition-colors">
                        <td className="py-3.5 px-6 text-[#39ff14]">{trail.documentId}</td>
                        <td className="py-3.5 px-6 text-[#f3f4f6] font-semibold">{trail.actorRole === 'STAFF' ? 'Bùi Nguyễn Yến Vy' : 'Trần Thanh Minh'} ({trail.actorRole})</td>
                        <td className="py-3.5 px-6">
                          <span className={`inline-flex px-2 py-0.5 rounded font-extrabold text-[10px] ${
                            trail.action.includes('APPROVE') ? 'bg-[#1a3d24] text-[#4aff73]' : 
                            trail.action.includes('REJECT') ? 'bg-[#3d1a1a] text-[#ff4a4a]' : 'bg-[#1e2330] text-[#60a5fa]'
                          }`}>
                            {trail.action}
                          </span>
                        </td>
                        <td className="py-3.5 px-6 text-[#848c9e]">{trail.timestamp}</td>
                        <td className="py-3.5 px-6 text-[#c5c9d6] italic max-w-xs truncate">{trail.feedback || "Không có phản hồi"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* SCREEN 2: DETAILED REVIEW WORKSPACE */}
        {screen === 'workspace' && selectedDoc && (
          <div className="space-y-6 animate-fade-in">
            {/* WORKSPACE HEADER */}
            <div className="flex items-center justify-between">
              <button 
                onClick={() => setScreen('dashboard')}
                className="text-[#ec4899] hover:text-[#f472b6] font-bold text-sm flex items-center transition-all hover:-translate-x-1"
              >
                ◀ Back to Review Queue
              </button>
              <div className="flex items-center space-x-4">
                <h2 className="text-lg font-bold text-[#f3f4f6]">
                  Reviewing: <span className="text-[#39ff14]">{selectedDoc.name}</span> ({selectedDoc.id})
                </h2>
                <span className={`px-2.5 py-1 rounded text-xs font-extrabold border ${
                  selectedDoc.severity === 'CRITICAL' ? 'bg-[#3d1a1a] text-[#ff4a4a] border-[#6b1e1e]' :
                  selectedDoc.severity === 'HIGH' ? 'bg-[#3d2a1a] text-[#ff984a] border-[#6b471e]' :
                  selectedDoc.severity === 'MEDIUM' ? 'bg-[#393d1a] text-[#e6c34a] border-[#646b1e]' :
                  'bg-[#1a3d24] text-[#4aff73] border-[#1e6b36]'
                }`}>
                  Drift Severity: {selectedDoc.severity} {selectedDoc.severity === 'CRITICAL' ? '🚨' : ''}
                </span>
              </div>
            </div>

            {/* SPLIT VIEW (SIDE-BY-SIDE SIDE_BARS) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* LEFT PANEL: OLD VERSION */}
              <div className="bg-[#12131a] border border-[#21232d] rounded-xl p-5 flex flex-col h-[400px]">
                <h3 className="text-xs font-bold text-[#848c9e] uppercase tracking-wider mb-3 flex items-center">
                  <span className="w-1.5 h-1.5 bg-[#848c9e] rounded-full mr-2"></span>
                  LAST APPROVED VERSION (BẢN CŨ ĐÃ DUYỆT)
                </h3>
                <div className="bg-[#090a0f] border border-[#1c1d26] rounded-lg p-4 font-mono text-xs text-[#9ca3af] overflow-y-auto flex-1 leading-relaxed">
                  {selectedDoc.oldContent.map((line, idx) => (
                    <div key={idx} className="hover:bg-[#161722] py-0.5 px-1 rounded">{line}</div>
                  ))}
                </div>
              </div>

              {/* RIGHT PANEL: NEW VERSION SUGGESTION */}
              <div className="bg-[#12131a] border border-[#233d26] rounded-xl p-5 flex flex-col h-[400px]">
                <h3 className="text-xs font-bold text-[#39ff14] uppercase tracking-wider mb-3 flex items-center">
                  <span className="w-1.5 h-1.5 bg-[#39ff14] rounded-full mr-2"></span>
                  AI-GENERATED SUGGESTION (BẢN MỚI CHỜ DUYỆT)
                </h3>
                <div className="bg-[#090a0f] border border-[#1e2f22] rounded-lg p-4 font-mono text-xs text-[#aefca2] overflow-y-auto flex-1 leading-relaxed">
                  {selectedDoc.newContent.map((line, idx) => {
                    const isChanged = line.includes("Updated") || line.includes("Added") || line.includes("- **") || line.includes("-   - **");
                    return (
                      <div 
                        key={idx} 
                        className={`py-0.5 px-1 rounded ${isChanged ? 'bg-[#1e3d24] text-[#4aff73] font-semibold' : 'opacity-85 text-[#c5c9d6]'}`}
                      >
                        {line}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* BOTTOM PANELS: EVIDENCE & ACTION */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* BOTTOM LEFT: EVIDENCE PANEL */}
              <div className="bg-[#12131a] border border-[#202d3d] rounded-xl p-5">
                <h3 className="text-xs font-bold text-[#60a5fa] uppercase tracking-wider mb-4 flex items-center">
                  <span className="w-1.5 h-1.5 bg-[#60a5fa] rounded-full mr-2"></span>
                  GROUNDING EVIDENCE (BẰNG CHỨNG ĐỐI CHIẾU THỰC TẾ)
                </h3>
                <ul className="space-y-3.5 text-xs text-[#9ca3af]">
                  <li className="flex justify-between items-center border-b border-[#1c1d26] pb-2">
                    <span className="text-[#646a80] font-medium">Git Repository:</span>
                    <span className="font-mono text-[#f3f4f6]">{selectedDoc.evidence.repo}</span>
                  </li>
                  <li className="flex justify-between items-center border-b border-[#1c1d26] pb-2">
                    <span className="text-[#646a80] font-medium">Code Commit ID:</span>
                    <span className="font-mono text-[#f3f4f6]">{selectedDoc.evidence.commit}</span>
                  </li>
                  <li className="flex justify-between items-center border-b border-[#1c1d26] pb-2">
                    <span className="text-[#646a80] font-medium">Trigger Source:</span>
                    <span className="font-mono text-[#39ff14] font-semibold">{selectedDoc.evidence.trigger}</span>
                  </li>
                  <li className="flex justify-between items-center border-b border-[#1c1d26] pb-2">
                    <span className="text-[#646a80] font-medium">Code Diff Analyzed:</span>
                    <span className="text-[#f3f4f6] italic">"{selectedDoc.evidence.diff}"</span>
                  </li>
                  <li className="flex justify-between items-center border-b border-[#1c1d26] pb-2">
                    <span className="text-[#646a80] font-medium">Target Template:</span>
                    <span className="text-[#f3f4f6] font-semibold">{selectedDoc.evidence.template}</span>
                  </li>
                  <li className="flex justify-between items-center border-b border-[#1c1d26] pb-2">
                    <span className="text-[#646a80] font-medium">Associated Jira Ticket:</span>
                    <span className="bg-[#1e2330] text-[#60a5fa] px-2 py-0.5 rounded font-mono font-bold">{selectedDoc.evidence.ticket}</span>
                  </li>
                  <li className="flex justify-between items-center pt-1">
                    <span className="text-[#646a80] font-medium">AI Confidence Level:</span>
                    <span className="text-[#39ff14] font-bold bg-[#1a3d24] px-2 py-0.5 rounded border border-[#1e6b36]">{selectedDoc.evidence.confidence}</span>
                  </li>
                </ul>
              </div>

              {/* BOTTOM RIGHT: DECISION & ACTION PANEL */}
              <div className="bg-[#12131a] border border-[#3d2134] rounded-xl p-5 flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-bold text-[#ec4899] uppercase tracking-wider mb-3 flex items-center">
                    <span className="w-1.5 h-1.5 bg-[#ec4899] rounded-full mr-2"></span>
                    REVIEW ACTIONS & DECISIONS (HÀNH ĐỘNG DUYỆT)
                  </h3>
                  <textarea 
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Add feedback comments here if rejecting..."
                    className="w-full h-32 bg-[#090a0f] border border-[#2c2f3d] rounded-lg p-3 text-xs text-[#e3e4e8] placeholder-[#535970] focus:outline-none focus:border-[#ec4899] resize-none transition-all"
                  />
                </div>

                {/* WORKSPACE BUTTONS */}
                <div className="flex gap-3 mt-4">
                  <button 
                    onClick={() => showNotification("Chức năng chỉnh sửa tài liệu trực tiếp trên Web sắp ra mắt (Giai đoạn sau)!", "info")}
                    className="flex-1 bg-[#ffdf00] hover:bg-[#e6c200] text-[#12131a] font-extrabold text-xs py-3 rounded-lg shadow transition-all active:scale-95 flex items-center justify-center space-x-1"
                  >
                    <span>✏️ Edit Draft</span>
                  </button>
                  <button 
                    onClick={() => handleReject(selectedDoc.id)}
                    className="flex-1 bg-[#ff4a4a] hover:bg-[#d93838] text-white font-extrabold text-xs py-3 rounded-lg shadow transition-all active:scale-95 flex items-center justify-center space-x-1"
                  >
                    <span>🛑 REJECT (Draft)</span>
                  </button>
                  <button 
                    onClick={() => handleApprove(selectedDoc.id)}
                    className="flex-2 bg-[#22c55e] hover:bg-[#16a34a] text-[#12131a] font-black text-xs py-3 px-6 rounded-lg shadow transition-all active:scale-95 flex items-center justify-center space-x-1"
                  >
                    <span>✓ APPROVE (Duyệt)</span>
                  </button>
                  <button 
                    onClick={() => {
                      // Gọi API duyệt xuất bản thật xuống Backend của Minh
                      fetch(`http://localhost:8080/api/documents/${selectedDoc.id}/publish`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ actor: "Trần Thanh Minh", feedback: "Manager phê duyệt xuất bản cuối cùng lên GitHub." })
                      })
                      .then(async(response)=>{

                          if(!response.ok)
                            throw new Error();

                          setDocuments(prev=>prev.filter(d=>d.id!==selectedDoc.id));
                          setScreen("dashboard");

                          showNotification(
                            `[Manager] Đã xuất bản thành công!`,
                            "success"
                          );
                      })
                      .catch(err => {
                        // Demo dự phòng nếu chưa liên thông API publish thật
                        setDocuments(prev => prev.filter(d => d.id !== selectedDoc.id));
                        setScreen('dashboard');
                        showNotification(`[Manager Demo] Đã xuất bản tài liệu ${selectedDoc.id} và ghi log GitHub thành công!`, 'success');
                      });
                    }}
                    className="flex-1 bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-black text-xs py-3 px-4 rounded-lg shadow transition-all active:scale-95 flex items-center justify-center space-x-1"
                  >
                    <span>🚀 MANAGER PUBLISH</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* MINI FOOTER */}
      <footer className="mt-12 border-t border-[#1c1d26] py-6 text-center text-[#535970] text-xs">
        &copy; 2026 LivingDocs Project - Designed by Bui Nguyen Yen Vy & Tran Thanh Minh.
      </footer>
    </div>
  );
}
