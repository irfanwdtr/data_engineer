# AWS EMR Hadoop Basics (HDFS + Hive via SSM)

Repo ini berisi rangkuman praktik belajar Hadoop (HDFS & Hive) di AWS EMR
menggunakan SSM Session Manager (tanpa SSH, tanpa keypair).

---

## 1. Tujuan Belajar

1. Memahami arsitektur Hadoop (NameNode, DataNode, YARN)
2. Praktik dasar HDFS (mkdir, put, ls, cat, rm)
3. Praktik Hive SQL di atas data HDFS

---

## 2. Konfigurasi Cluster

- Cluster Name: emr-hadoop-basics
- EMR Version: emr-7.12.0
- Applications:
  - Hadoop 3.4.1
  - Hive 3.1.3
- Cluster Type: EMR on EC2
- Instance Type: m5.xlarge
- Node:
  - 1 Primary (NameNode + ResourceManager)
  - 1 Core (DataNode + NodeManager)
- Region: us-east-1
- Access: SSM Session Manager (tanpa SSH)

---

## 3. Masuk ke Cluster (SSM)

AWS Console → EMR → Clusters → emr-hadoop-basics  
→ Instances → Primary → EC2 Instance ID  
→ Connect → Session Manager → Connect  

Catatan:
Menutup terminal hanya memutus session, cluster tetap hidup.

---

## 4. Masuk ke User Hadoop

```bash
whoami
sudo su - hadoop
whoami
```

Expected output:
```
hadoop
```

---

## 5. Praktik HDFS

### 5.1 Cek Root HDFS
```bash
hdfs dfs -ls /
```

### 5.2 Cek Direktori User
```bash
hdfs dfs -ls /user
hdfs dfs -ls /user/hadoop
```

Direktori standar:
- /user/hadoop
- /user/hive
- /user/history
- /user/root

### 5.3 Buat Folder Kerja
```bash
hdfs dfs -mkdir /user/hadoop/input
hdfs dfs -ls /user/hadoop
```

### 5.4 Buat File CSV & Upload ke HDFS
```bash
echo -e "1,andi,90\n2,budi,85\n3,citra,95" > nilai.csv
ls -l nilai.csv
cat nilai.csv

hdfs dfs -put nilai.csv /user/hadoop/input/
hdfs dfs -ls /user/hadoop/input
hdfs dfs -cat /user/hadoop/input/nilai.csv
```

### 5.5 Hapus File di HDFS
```bash
hdfs dfs -rm /user/hadoop/input/nilai.csv
hdfs dfs -rm -r /user/hadoop/input
```

---

## 6. Block & Metadata HDFS

### 6.1 Metadata File
```bash
hdfs dfs -stat "%n | size=%b | repl=%r | block=%o" /user/hadoop/input/nilai.csv
```

Keterangan:
- size  = ukuran file (byte)
- repl  = replication factor
- block = ukuran block HDFS (±128 MB)

### 6.2 Lokasi Block (DataNode)
```bash
hdfs fsck /user/hadoop/input/nilai.csv -files -blocks -locations
```

---

## 7. Praktik Hive (Beeline)

### 7.1 Masuk Beeline
```bash
beeline
```

### 7.2 Connect ke HiveServer2
```sql
!connect jdbc:hive2://localhost:10000/default
```

Username:
```
hadoop
```

Password:
```
(kosong, tekan ENTER)
```

### 7.3 Database & Table
```sql
CREATE DATABASE IF NOT EXISTS belajar;
USE belajar;

CREATE TABLE nilai (
  id INT,
  nama STRING,
  skor INT
)
ROW FORMAT DELIMITED
FIELDS TERMINATED BY ','
STORED AS TEXTFILE;

LOAD DATA INPATH '/user/hadoop/input/nilai.csv'
INTO TABLE nilai;
```

### 7.4 Query Hive
```sql
SELECT * FROM nilai;

SELECT AVG(skor) AS rata_rata FROM nilai;

SELECT COUNT(*) AS jumlah_data FROM nilai;

SELECT * FROM nilai WHERE skor >= 90;

SELECT * FROM nilai ORDER BY skor DESC;
```

---

## 8. Ringkasan Konsep

- HDFS
  - NameNode: metadata
  - DataNode: penyimpanan block
- Hive
  - SQL layer di atas HDFS
  - Menyimpan metadata, bukan data fisik
- YARN
  - Resource manager (CPU & memory)
  - Menjalankan job Hive / MapReduce / Spark

---

## 9. Penutup

Dokumentasi ini adalah hasil praktik langsung belajar Hadoop di AWS EMR,
difokuskan pada pemahaman konsep dan hands-on dasar sebagai fondasi
menuju Data Engineer.
