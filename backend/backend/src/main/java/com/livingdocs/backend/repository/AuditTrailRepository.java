package com.livingdocs.backend.repository;

import com.livingdocs.backend.model.AuditTrail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AuditTrailRepository extends JpaRepository<AuditTrail, Long> {}