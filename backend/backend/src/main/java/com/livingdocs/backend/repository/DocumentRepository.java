package com.livingdocs.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.livingdocs.backend.model.Document;

@Repository
public interface DocumentRepository extends JpaRepository<Document, String> {}