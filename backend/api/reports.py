import csv
import io
from datetime import datetime
from flask import Blueprint, request, make_response, jsonify
from models.database import SessionLocal, Threat, TrafficRecord, Device, Prediction

reports_bp = Blueprint("reports", __name__, url_prefix="/api/reports")

@reports_bp.route("/threats", methods=["GET"])
def export_threats_report():
    fmt = request.args.get("format", "csv").lower()
    db = SessionLocal()
    threats = db.query(Threat).order_by(Threat.detected_at.desc()).all()
    
    if fmt == "csv":
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(["Threat ID", "Device Name", "Device IP", "Threat Category", "Severity", "Confidence", "Status", "Detected Timestamp"])
        
        for t in threats:
            dev = t.device
            pred = t.prediction
            writer.writerow([
                t.id,
                dev.device_name if dev else "Unknown",
                dev.ip_address if dev else "N/A",
                t.threat_type,
                t.severity,
                f"{pred.confidence*100:.1f}%" if pred else "95.0%",
                t.status,
                t.detected_at.strftime("%Y-%m-%d %H:%M:%S")
            ])
            
        db.close()
        response = make_response(output.getvalue())
        response.headers["Content-Disposition"] = "attachment; filename=iot_threats_report.csv"
        response.headers["Content-type"] = "text/csv"
        return response
        
    elif fmt == "pdf":
        try:
            from reportlab.lib.pagesizes import letter
            from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
            from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
            from reportlab.lib import colors
            
            buffer = io.BytesIO()
            doc = SimpleDocTemplate(buffer, pagesize=letter)
            elements = []
            styles = getSampleStyleSheet()
            
            title_style = ParagraphStyle(
                'ReportTitle',
                parent=styles['Heading1'],
                fontSize=18,
                textColor=colors.HexColor("#0F172A"),
                spaceAfter=12
            )
            elements.append(Paragraph("IoT Threat Detection Security Report", title_style))
            elements.append(Paragraph(f"Generated on: {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S UTC')}", styles['Normal']))
            elements.append(Spacer(1, 15))
            
            # Summary Table
            table_data = [["ID", "Device", "Threat Type", "Severity", "Status", "Timestamp"]]
            for t in threats[:30]: # Limit for PDF preview formatting
                dev = t.device
                table_data.append([
                    str(t.id),
                    dev.device_name[:15] if dev else "Unknown",
                    t.threat_type,
                    t.severity,
                    t.status,
                    t.detected_at.strftime("%m/%d %H:%M")
                ])
                
            t_table = Table(table_data, colWidths=[30, 110, 100, 70, 80, 100])
            t_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#1E293B")),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 10),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 6),
                ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor("#F8FAFC")),
                ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1"))
            ]))
            elements.append(t_table)
            
            doc.build(elements)
            buffer.seek(0)
            db.close()
            
            response = make_response(buffer.getvalue())
            response.headers["Content-Disposition"] = "attachment; filename=iot_threats_report.pdf"
            response.headers["Content-type"] = "application/pdf"
            return response
        except Exception as e:
            db.close()
            return jsonify({"error": f"PDF generation error: {str(e)}"}), 500
            
    db.close()
    return jsonify({"error": "Unsupported format"}), 400

@reports_bp.route("/traffic", methods=["GET"])
def export_traffic_report():
    db = SessionLocal()
    traffic = db.query(TrafficRecord).order_by(TrafficRecord.timestamp.desc()).limit(200).all()
    
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Traffic ID", "Device Name", "Source IP", "Destination IP", "Protocol", "Dest Port", "Packets", "Flow Duration (ms)", "Prediction", "Severity", "Timestamp"])
    
    for r in traffic:
        dev = r.device
        pred = r.prediction
        writer.writerow([
            r.id,
            dev.device_name if dev else "Unknown",
            r.source_ip,
            r.destination_ip,
            r.protocol,
            r.destination_port,
            r.packet_count,
            r.flow_duration,
            pred.prediction if pred else "Normal",
            pred.severity if pred else "SAFE",
            r.timestamp.strftime("%Y-%m-%d %H:%M:%S")
        ])
        
    db.close()
    response = make_response(output.getvalue())
    response.headers["Content-Disposition"] = "attachment; filename=iot_network_traffic_report.csv"
    response.headers["Content-type"] = "text/csv"
    return response
