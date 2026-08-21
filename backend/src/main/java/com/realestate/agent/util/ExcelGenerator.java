package com.realestate.agent.util;

import com.realestate.agent.entity.DueDiligenceReport;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

import org.springframework.stereotype.Component;

import java.io.ByteArrayOutputStream;

@Component
public class ExcelGenerator {

    public byte[] generateExcel(DueDiligenceReport report) {

        try (XSSFWorkbook workbook = new XSSFWorkbook()) {

            Sheet sheet = workbook.createSheet("Due Diligence Report");

            int rowNum = 0;

            Row row = sheet.createRow(rowNum++);
            row.createCell(0).setCellValue("Report ID");
            row.createCell(1).setCellValue(report.getReportId());

            row = sheet.createRow(rowNum++);
            row.createCell(0).setCellValue("Report Name");
            row.createCell(1).setCellValue(report.getReportName());

            row = sheet.createRow(rowNum++);
            row.createCell(0).setCellValue("Property");
            row.createCell(1).setCellValue(report.getProperty().getPropertyName());

            row = sheet.createRow(rowNum++);
            row.createCell(0).setCellValue("Executive Summary");
            row.createCell(1).setCellValue(report.getExecutiveSummary());

            row = sheet.createRow(rowNum++);
            row.createCell(0).setCellValue("Overall Risk Score");
            row.createCell(1).setCellValue(
                    report.getOverallRiskScore() == null
                            ? 0
                            : report.getOverallRiskScore().doubleValue()
            );

            row = sheet.createRow(rowNum++);
            row.createCell(0).setCellValue("Report Status");
            row.createCell(1).setCellValue(report.getReportStatus());

            row = sheet.createRow(rowNum++);
            row.createCell(0).setCellValue("Generated At");
            row.createCell(1).setCellValue(report.getGeneratedAt().toString());

            sheet.autoSizeColumn(0);
            sheet.autoSizeColumn(1);

            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();

            workbook.write(outputStream);

            return outputStream.toByteArray();

        } catch (Exception e) {
            throw new RuntimeException("Failed to generate Excel.", e);
        }
    }
}