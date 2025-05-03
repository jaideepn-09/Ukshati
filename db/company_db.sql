-- MySQL dump 10.13  Distrib 8.0.41, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: company_db
-- ------------------------------------------------------
-- Server version	8.4.4

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Create database and user
--
CREATE DATABASE IF NOT EXISTS `company_db` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `company_db`;

CREATE USER IF NOT EXISTS 'company'@'%' IDENTIFIED BY 'Ukshati@123';
GRANT ALL PRIVILEGES ON company_db.* TO 'company'@'%';
FLUSH PRIVILEGES;

--
-- Table structure for table `category`
--
DROP TABLE IF EXISTS `category`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `category` (
  `category_id` int NOT NULL,
  `category_name` varchar(50) NOT NULL,
  PRIMARY KEY (`category_id`),
  UNIQUE KEY `category_name` (`category_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `category`
--
LOCK TABLES `category` WRITE;
/*!40000 ALTER TABLE `category` DISABLE KEYS */;
INSERT INTO `category` VALUES 
(1,'Tools'),
(2,'Electronics'),
(3,'Pumping'),
(4,'Drip'),
(5,'Plumbing'),
(6,'Automation'),
(7,'Labour');
/*!40000 ALTER TABLE `category` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `customer`
--
DROP TABLE IF EXISTS `customer`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `customer` (
  `cid` int NOT NULL AUTO_INCREMENT,
  `cname` varchar(255) NOT NULL,
  `cphone` varchar(15) NOT NULL,
  `alternate_phone` varchar(15) DEFAULT NULL,
  `status` enum('lead','customer') NOT NULL DEFAULT 'customer',
  `follow_up_date` date DEFAULT NULL,
  `join_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `remark` text,
  PRIMARY KEY (`cid`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customer`
--
LOCK TABLES `customer` WRITE;
/*!40000 ALTER TABLE `customer` DISABLE KEYS */;
INSERT INTO `customer` VALUES 
(1,'John Doe','9876543210',NULL,'lead',NULL,CURRENT_TIMESTAMP,NULL),
(2,'Jane Smith','9123456789',NULL,'customer',NULL,CURRENT_TIMESTAMP,NULL),
(3,'Michael Green','9456723421',NULL,'lead',NULL,CURRENT_TIMESTAMP,NULL),
(4,'Sarah Miller','9781234567',NULL,'customer',NULL,CURRENT_TIMESTAMP,NULL),
(5,'Daniel Scott','9345678901',NULL,'lead',NULL,CURRENT_TIMESTAMP,NULL);
/*!40000 ALTER TABLE `customer` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `employee`
--
DROP TABLE IF EXISTS `employee`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employee` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL UNIQUE,
  `phone` varchar(20) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `role` varchar(50) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `employee`
--
LOCK TABLES `employee` WRITE;
/*!40000 ALTER TABLE `employee` DISABLE KEYS */;
INSERT INTO `employee` (`name`, `email`, `phone`, `password`, `role`) VALUES
('Alice Johnson', 'admin@example.com', '9876543210', '$2b$10$paEhzm4yqGvqSgGpm4vGAeuhAQGcIMvQm8dtEgrbS0K6U6fGg52jS', 'Admin'),
('Bob Smith', 'bob@example.com', '9123456789', '$2b$10$G8vHZuRKnA.jR6fzELaWyOo3XpRDFogSvK0nEWq0gVk2eEz2TyZDG', 'Employee'),
('Charlie Brown', 'employee@example.com', '9456723421', '$2b$10$8xY5DPDdxD8oGWAEL3xAL..VjDG0rvZevr7bNOoLEzaO7E4fV/EZq', 'Employee'),
('David Lee', 'david@example.com', '9781234567', '$2b$10$EPwbVb6bnIT7M0xZLb0UneVrScwlbjVnFQwTO0p093xs0Iev/falK', 'Employee'),
('Eva White', 'eva@example.com', '9345678901', '$2b$10$2HIxE4dJc/bhoCBURewwHeyvz6dCesqAaQicQDFI/SogbZhIgDZ3i', 'Admin');
/*!40000 ALTER TABLE `employee` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `stock`
--
DROP TABLE IF EXISTS `stock`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `stock` (
  `stock_id` int NOT NULL AUTO_INCREMENT,
  `item_name` varchar(100) NOT NULL,
  `category_id` int NOT NULL,
  `quantity` int NOT NULL,
  `price_pu` decimal(10,2) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`stock_id`),
  KEY `category_id` (`category_id`),
  CONSTRAINT `stock_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `category` (`category_id`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `stock`
--
LOCK TABLES `stock` WRITE;
/*!40000 ALTER TABLE `stock` DISABLE KEYS */;
INSERT INTO `stock` VALUES 
(1, 'Hammer', 1, 20, 500.00, NOW(), NOW()),
(2, 'Screwdriver Set', 1, 15, 750.00, NOW(), NOW()),
(3, 'LED Monitor', 2, 12, 15000.00, NOW(), NOW()),
(4, 'Laptop', 2, 2, 60000.00, NOW(), NOW()),
(5, 'Water Pump', 3, 5, 25000.00, NOW(), NOW()),
(6, 'Submersible Pump', 3, 3, 30000.00, NOW(), NOW()),
(7, 'Drip Irrigation Kit', 4, 8, 10000.00, NOW(), NOW()),
(8, 'Smart Irrigation Controller', 4, 6, 12000.00, NOW(), NOW()),
(9, 'PVC Pipes', 5, 25, 2000.00, NOW(), NOW()),
(10, 'Pipe Fittings Set', 5, 30, 1500.00, NOW(), NOW()),
(11, 'Electric Valve', 6, 10, 5000.00, NOW(), NOW()),
(12, 'Automation Controller', 6, 5, 25000.00, NOW(), NOW()),
(13, 'Solar Panel', 6, 7, 40000.00, NOW(), NOW()),
(14, 'Wiring Kit', 6, 20, 3000.00, NOW(), NOW()),
(15, 'Skilled Labour', 7, 50, 500.00, NOW(), NOW()),
(16, 'Unskilled Labour', 7, 70, 300.00, NOW(), NOW()),
(17, 'Plumbing Labour', 7, 40, 400.00, NOW(), NOW()),
(18, 'Masonry Labour', 7, 30, 450.00, NOW(), NOW());
/*!40000 ALTER TABLE `stock` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `project`
--
DROP TABLE IF EXISTS `project`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `project` (
  `pid` int NOT NULL AUTO_INCREMENT,
  `pname` varchar(50) NOT NULL,
  `cid` int DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date NULL,
  `status` enum('Ongoing','Completed','On Hold') DEFAULT 'Ongoing',
  `cname` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`pid`),
  KEY `cid` (`cid`),
  CONSTRAINT `project_ibfk_1` FOREIGN KEY (`cid`) REFERENCES `customer` (`cid`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `project`
--
LOCK TABLES `project` WRITE;
/*!40000 ALTER TABLE `project` DISABLE KEYS */;
INSERT INTO `project` VALUES 
(1, 'Irrigation System', 1, '2024-01-10', '2024-06-15', 'Ongoing', 'John Doe'),
(2, 'Website Development', 2, '2024-01-01', '2024-06-01', 'Ongoing', 'Jane Smith'),
(3, 'Greenhouse Automation', 3, '2024-03-20', '2024-09-25', 'Completed', 'Michael Green'),
(4, 'Mobile App', 4, '2024-03-15', '2024-09-15', 'Completed', 'Sarah Miller'),
(5, 'Drone Surveillance Program', 5, '2025-02-10', '2025-09-10', 'On Hold', 'Daniel Scott'),
(6, 'Automated Harvesting Beta', 4, '2025-02-21', '2025-07-21', 'Ongoing', 'Sarah Miller');
/*!40000 ALTER TABLE `project` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inventory_spent`
--
DROP TABLE IF EXISTS `inventory_spent`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `inventory_spent` (
  `spent_id` int NOT NULL AUTO_INCREMENT,
  `stock_id` int DEFAULT NULL,
  `quantity_used` int DEFAULT NULL,
  `used_for` int DEFAULT NULL,
  `recorded_by` int DEFAULT NULL,
  `location` varchar(100) DEFAULT NULL,
  `remark` text,
  `spent_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `recorded_date` DATE DEFAULT (CURRENT_DATE),
  PRIMARY KEY (`spent_id`),
  KEY `stock_id` (`stock_id`),
  KEY `used_for` (`used_for`),
  KEY `recorded_by` (`recorded_by`),
  CONSTRAINT `inventory_spent_ibfk_1` FOREIGN KEY (`stock_id`) REFERENCES `stock` (`stock_id`) ON DELETE CASCADE,
  CONSTRAINT `inventory_spent_ibfk_2` FOREIGN KEY (`used_for`) REFERENCES `project` (`pid`) ON DELETE CASCADE,
  CONSTRAINT `inventory_spent_ibfk_3` FOREIGN KEY (`recorded_by`) REFERENCES `employee` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `add_expenses`
--
DROP TABLE IF EXISTS `add_expenses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `add_expenses` (
  `Exp_ID` int NOT NULL AUTO_INCREMENT,
  `Date` date NOT NULL,
  `id` int NOT NULL,
  `pid` int NOT NULL,
  `Amount` decimal(10,2) NOT NULL,
  `Status` enum('Pending','Approved','Rejected') NOT NULL DEFAULT 'Pending',
  `Comments` text,
  PRIMARY KEY (`Exp_ID`),
  KEY `id` (`id`),
  KEY `pid` (`pid`),
  CONSTRAINT `add_expenses_ibfk_1` FOREIGN KEY (`id`) REFERENCES `employee` (`id`) ON DELETE CASCADE,
  CONSTRAINT `add_expenses_ibfk_2` FOREIGN KEY (`pid`) REFERENCES `project` (`pid`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `add_expenses`
--
LOCK TABLES `add_expenses` WRITE;
/*!40000 ALTER TABLE `add_expenses` DISABLE KEYS */;
INSERT INTO `add_expenses` (`Exp_ID`, `Date`, `id`, `pid`, `Amount`, `Status`, `Comments`) VALUES
(1, '2024-03-01', 2, 1, 5000.00, 'Pending', 'Project material purchase'),
(2, '2024-03-02', 2, 2, 3000.50, 'Approved', 'Sensor installation cost'),
(3, '2024-03-05', 3, 3, 4200.75, 'Approved', 'Automation setup expense'),
(4, '2024-03-07', 4, 4, 2500.00, 'Rejected', 'Consultation charges'),
(5, '2024-03-10', 5, 5, 10000.00, 'Pending', 'Drone surveillance setup'),
(6, '2024-03-12', 3, 6, 3200.25, 'Approved', 'Beta testing expenses');
/*!40000 ALTER TABLE `add_expenses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rates`
--
DROP TABLE IF EXISTS `rates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rates` (
  `rate_id` int NOT NULL,
  `item_id` int DEFAULT NULL,
  `rate_type` varchar(50) DEFAULT NULL,
  `item_name` varchar(50) DEFAULT NULL,
  `quantity` int DEFAULT NULL,
  `price_pu` decimal(10,2) DEFAULT NULL,
  `category_id` int DEFAULT NULL,
  PRIMARY KEY (`rate_id`),
  KEY `item_id` (`item_id`),
  KEY `category_id` (`category_id`),
  CONSTRAINT `rates_ibfk_1` FOREIGN KEY (`item_id`) REFERENCES `stock` (`stock_id`),
  CONSTRAINT `rates_ibfk_2` FOREIGN KEY (`category_id`) REFERENCES `category` (`category_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rates`
--
LOCK TABLES `rates` WRITE;
/*!40000 ALTER TABLE `rates` DISABLE KEYS */;
INSERT INTO `rates` (`rate_id`, `item_id`, `rate_type`, `item_name`, `quantity`, `price_pu`, `category_id`) VALUES
(1, 1, 'Tools', 'Hammer', 20, 500.00, 1),
(2, 2, 'Tools', 'Screwdriver Set', 15, 750.00, 1),
(3, 3, 'Electronics', 'LED Monitor', 12, 15000.00, 2),
(4, 4, 'Electronics', 'Laptop', 10, 60000.00, 2),
(5, 5, 'Pumping', 'Water Pump', 5, 25000.00, 3),
(6, 6, 'Pumping', 'Submersible Pump', 3, 30000.00, 3),
(7, 7, 'Drip', 'Drip Irrigation Kit', 8, 10000.00, 4),
(8, 8, 'Drip', 'Smart Irrigation Controller', 6, 12000.00, 4),
(9, 9, 'Plumbing', 'PVC Pipes', 25, 2000.00, 5),
(10, 10, 'Plumbing', 'Pipe Fittings Set', 30, 1500.00, 5),
(11, 11, 'Automation', 'Electric Valve', 10, 5000.00, 6),
(12, 12, 'Automation', 'Automation Controller', 5, 25000.00, 6),
(13, 13, 'Automation', 'Solar Panel', 7, 40000.00, 6),
(14, 14, 'Automation', 'Wiring Kit', 20, 3000.00, 6),
(15, 15, 'Labour', 'Skilled Labour', 50, 500.00, 7),
(16, 16, 'Labour', 'Unskilled Labour', 70, 300.00, 7),
(17, 17, 'Labour', 'Plumbing Labour', 40, 400.00, 7),
(18, 18, 'Labour', 'Masonry Labour', 30, 450.00, 7);
/*!40000 ALTER TABLE `rates` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `works_on`
--
DROP TABLE IF EXISTS `works_on`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `works_on` (
  `emp_id` int NOT NULL,
  `pid` int NOT NULL,
  PRIMARY KEY (`emp_id`,`pid`),
  KEY `works_on_ibfk_2` (`pid`),
  CONSTRAINT `works_on_ibfk_1` FOREIGN KEY (`emp_id`) REFERENCES `employee` (`id`),
  CONSTRAINT `works_on_ibfk_2` FOREIGN KEY (`pid`) REFERENCES `project` (`pid`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `works_on`
--
LOCK TABLES `works_on` WRITE;
/*!40000 ALTER TABLE `works_on` DISABLE KEYS */;
INSERT INTO `works_on` VALUES 
(1,1),
(2,1),
(3,2),
(4,2),
(5,3),
(1,3),
(2,4),
(3,5),
(4,6),
(5,6);
/*!40000 ALTER TABLE `works_on` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `quotesdata`
--
DROP TABLE IF EXISTS `quotesdata`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `quotesdata` (
   `quote_id` int NOT NULL AUTO_INCREMENT,
   `project_id` int DEFAULT NULL,
   `customer_name` varchar(255) DEFAULT NULL,
   `date` date NOT NULL DEFAULT (curdate()),
   `automation_cost` decimal(10,2) DEFAULT NULL,
   `drip_cost` decimal(10,2) DEFAULT NULL,
   `electronics_cost` decimal(10,2) DEFAULT NULL,
   `labour_cost` decimal(10,2) DEFAULT NULL,
   `plumbing_cost` decimal(10,2) DEFAULT NULL,
   `pumping_cost` decimal(10,2) DEFAULT NULL,
   `tools_cost` decimal(10,2) DEFAULT NULL,
   `additional_cost` decimal(10,2) DEFAULT NULL,
   `total_cost` decimal(10,2) DEFAULT NULL,
   PRIMARY KEY (`quote_id`),
   KEY `project_id` (`project_id`),
   CONSTRAINT `quotesdata_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `project` (`pid`) ON DELETE CASCADE
 ) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `invoices`
--
DROP TABLE IF EXISTS `invoices`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `invoices` (
  `invoice_id` int NOT NULL AUTO_INCREMENT,
  `pid` int NOT NULL,
  `pname` varchar(255) NOT NULL,
  `cid` int NOT NULL,
  `cname` varchar(255) NOT NULL,
  `expenses` json NOT NULL,
  `extraExpenses` json NOT NULL,
  `inventory` json NOT NULL,
  `grandTotal` decimal(10,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`invoice_id`),
  KEY `pid` (`pid`),
  KEY `cid` (`cid`),
  CONSTRAINT `invoices_ibfk_1` FOREIGN KEY (`pid`) REFERENCES `project` (`pid`),
  CONSTRAINT `invoices_ibfk_2` FOREIGN KEY (`cid`) REFERENCES `customer` (`cid`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `reminders`
--
DROP TABLE IF EXISTS `reminders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reminders` (
    `rid` INT AUTO_INCREMENT PRIMARY KEY,
    `cid` INT NOT NULL,
    `reminder_date` DATE NOT NULL,
    `reminder_time` TIME NOT NULL,
    `message` TEXT NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`cid`) REFERENCES `customer`(`cid`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `stock_transactions`
--
DROP TABLE IF EXISTS `stock_transactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `stock_transactions` (
  `transaction_id` INT NOT NULL AUTO_INCREMENT,
  `stock_id` INT NOT NULL,
  `transaction_type` ENUM('ADD', 'SPEND', 'UPDATE', 'ADJUST') NOT NULL,
  `quantity_change` INT NOT NULL,
  `previous_quantity` INT NOT NULL,
  `new_quantity` INT NOT NULL,
  `price_pu` DECIMAL(10,2) NOT NULL,
  `project_id` INT DEFAULT NULL,
  `employee_id` INT NOT NULL,
  `transaction_date` DATE DEFAULT (CURRENT_DATE),
  `transaction_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `notes` TEXT,
  PRIMARY KEY (`transaction_id`),
  KEY `stock_id` (`stock_id`),
  KEY `project_id` (`project_id`),
  KEY `employee_id` (`employee_id`),
  CONSTRAINT `stock_transactions_ibfk_1` FOREIGN KEY (`stock_id`) REFERENCES `stock` (`stock_id`),
  CONSTRAINT `stock_transactions_ibfk_2` FOREIGN KEY (`project_id`) REFERENCES `project` (`pid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `stock_transactions`
--
LOCK TABLES `stock_transactions` WRITE;
/*!40000 ALTER TABLE `stock_transactions` DISABLE KEYS */;
/* Initial transactions will be added by triggers */
/*!40000 ALTER TABLE `stock_transactions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Triggers for stock tracking
--
DELIMITER //

-- Trigger for INSERT (adding new stock)
CREATE TRIGGER after_stock_insert
AFTER INSERT ON `stock`
FOR EACH ROW
BEGIN
    INSERT INTO stock_transactions (
        stock_id, 
        transaction_type, 
        quantity_change, 
        previous_quantity, 
        new_quantity, 
        price_pu, 
        employee_id,
        notes
    ) VALUES (
        NEW.stock_id, 
        'ADD', 
        NEW.quantity, 
        0, 
        NEW.quantity, 
        NEW.price_pu, 
        1, -- Default admin user
        CONCAT('Initial stock added - ', NEW.item_name)
    );
END//

-- Trigger for UPDATE (stock changes)
CREATE TRIGGER after_stock_update
AFTER UPDATE ON `stock`
FOR EACH ROW
BEGIN
    IF OLD.quantity != NEW.quantity OR OLD.price_pu != NEW.price_pu THEN
        INSERT INTO stock_transactions (
            stock_id, 
            transaction_type, 
            quantity_change, 
            previous_quantity, 
            new_quantity, 
            price_pu, 
            employee_id,
            notes
        ) VALUES (
            NEW.stock_id, 
            'UPDATE', 
            NEW.quantity - OLD.quantity, 
            OLD.quantity, 
            NEW.quantity, 
            NEW.price_pu, 
            1, -- Default admin user
            CONCAT('Stock updated - ', NEW.item_name, 
                  IF(OLD.quantity != NEW.quantity, CONCAT(' Quantity: ', OLD.quantity, '→', NEW.quantity), ''),
                  IF(OLD.price_pu != NEW.price_pu, CONCAT(' Price: ', OLD.price_pu, '→', NEW.price_pu), ''))
        );
    END IF;
END//

-- Trigger for inventory spending
CREATE TRIGGER after_inventory_spent
AFTER INSERT ON `inventory_spent`
FOR EACH ROW
BEGIN
    DECLARE prev_qty INT;
    DECLARE new_qty INT;
    DECLARE item_name VARCHAR(100);
    DECLARE item_price DECIMAL(10,2);
    
    -- Get current stock quantity and price
    SELECT quantity, price_pu, item_name INTO prev_qty, item_price, item_name 
    FROM stock WHERE stock_id = NEW.stock_id;
    
    -- Calculate new quantity
    SET new_qty = prev_qty - NEW.quantity_used;
    
    -- Update stock quantity
    UPDATE stock SET quantity = new_qty WHERE stock_id = NEW.stock_id;
    
    -- Log the transaction
    INSERT INTO stock_transactions (
        stock_id, 
        transaction_type, 
        quantity_change, 
        previous_quantity, 
        new_quantity, 
        price_pu, 
        project_id,
        employee_id,
        notes
    ) VALUES (
        NEW.stock_id, 
        'SPEND', 
        -NEW.quantity_used, 
        prev_qty, 
        new_qty, 
        item_price, 
        NEW.used_for,
        NEW.recorded_by,
        CONCAT('Used for project: ', 
              (SELECT pname FROM project WHERE pid = NEW.used_for), 
              ' - ', 
              IFNULL(NEW.remark, ''))
    );
END//

DELIMITER ;

/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;
/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-02-23 11:31:00