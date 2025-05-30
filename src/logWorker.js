// Adding log processing utility
import { processLogLine } from './utils/logProcessing';
// Adding web worker message handler for log processing
self.onmessage = async (e) => {
  // Adding data extraction from message event
  const { chunk, chunkIndex, chunkSize } = e.data;
  
  try {
    // Adding line parsing from chunk
    const lines = chunk
      .split('\n')
      .map(line => line.trim())
      .filter(line => line);

    // Adding results container for processed lines
    const results = {
      validLines: [],
      malformed: [],
      chunkIndex
    };

    // Adding line-by-line processing
    lines.forEach((line, index) => {
      try {
        // Adding line validation check
        if (!line || typeof line !== 'string') {
          throw new Error('Invalid line format');
        }
        // Adding line processing logic
        const processed = processLogLine(line);
        // Adding malformed line handling
        if (!processed) {
          results.malformed.push({
            lineNumber: index + 1 + (chunkIndex * chunkSize),
            content: line,
            error: 'Invalid log format',
            type: 'FORMAT_ERROR'
          });
        } else {
          // Adding valid line to results
          results.validLines.push(processed);
        }
      } catch (error) {
        // Adding error handling for parsing failures
        results.malformed.push({
          lineNumber: index + 1 + (chunkIndex * chunkSize),
          content: line,
          error: error.message,
          type: 'PARSING_ERROR'
        });
      }
    });

    // Adding results back to main thread
    self.postMessage(results);
  } catch (error) {
    // Adding error handling for chunk processing failures
    self.postMessage({ error: error.message, chunkIndex });
  }
}; 