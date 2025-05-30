export class StreamParser {
  constructor(chunkSize = 8 * 1024) { // 8KB chunks - smaller for better memory management
    this.chunkSize = chunkSize;
    this.buffer = '';
    this.lineCount = 0;
    this.validLines = [];
    this.malformedLines = [];
    this.batchSize = 1000; // Process 1000 lines at a time
  }

  async parseFile(file, onProgress) {
    const fileSize = file.size;
    let processedSize = 0;
    
    try {
      const reader = new FileReader();
      let batch = [];
      
      while (processedSize < fileSize) {
        const chunk = file.slice(processedSize, processedSize + this.chunkSize);
        const chunkText = await this.readChunk(reader, chunk);
        
        const lines = (this.buffer + chunkText).split('\n');
        this.buffer = lines.pop() || ''; // Save the last partial line
        
        for (const line of lines) {
          batch.push(line.trim());
          
          if (batch.length >= this.batchSize) {
            await this.processBatch(batch);
            batch = [];
            // Force garbage collection between batches
            await new Promise(resolve => setTimeout(resolve, 1));
          }
        }
        
        processedSize += this.chunkSize;
        if (onProgress) {
          onProgress(Math.min((processedSize / fileSize) * 100, 100));
        }
      }
      
      // Process remaining batch
      if (batch.length > 0) {
        await this.processBatch(batch);
      }
      
      // Process remaining buffer
      if (this.buffer) {
        await this.processBatch([this.buffer.trim()]);
      }
      
      return {
        validLines: this.validLines,
        malformedLines: this.malformedLines
      };
    } catch (error) {
      console.error('Error parsing file:', error);
      throw error;
    }
  }

  readChunk(reader, blob) {
    return new Promise((resolve, reject) => {
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(reader.error);
      reader.readAsText(blob);
    });
  }

  async processBatch(lines) {
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (!line) continue;

      try {
        const regex = /^(\S+) - - \[(.*?)\] "(\S+) (.*?) (\S+)" (\d+) (\d+) "([^"]*)" "([^"]*)"/;
        const match = line.match(regex);

        if (!match) {
          this.malformedLines.push({
            lineNumber: this.lineCount + i + 1,
            content: line,
            error: 'Invalid log format',
            type: 'FORMAT_ERROR'
          });
          continue;
        }

        const [, ip, timestamp, method, path, protocol, statusCode, bytes, referer, userAgent] = match;

        this.validLines.push({
          ip,
          timestamp: new Date(timestamp.replace(':', ' ')),
          method,
          path,
          protocol,
          statusCode: parseInt(statusCode),
          bytes: parseInt(bytes),
          referer,
          userAgent
        });
      } catch (error) {
        this.malformedLines.push({
          lineNumber: this.lineCount + i + 1,
          content: line,
          error: error.message,
          type: 'PARSING_ERROR'
        });
      }
    }
    this.lineCount += lines.length;
  }
} 