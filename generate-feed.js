const axios = require('axios');
const fs = require('fs');
const xml2js = require('xml2js');

const FEED_URL = 'https://feeds.soundcloud.com/users/soundcloud:users:1430002554/sounds.rss';

async function main() {
  const response = await axios.get(FEED_URL);
  const parser = new xml2js.Parser();
  const builder = new xml2js.Builder({
    xmldec: { version: '1.0', encoding: 'UTF-8' },
    renderOpts: { pretty: true }
  });

  const result = await parser.parseStringPromise(response.data);
  const rss = result.rss;
  const channel = rss.channel[0];

  // Add iTunes namespace
  rss.$ = {
    'xmlns:itunes': 'http://www.itunes.com/dtds/podcast-1.0.dtd',
    version: '2.0'
  };

  // Add Apple-required fields
  channel['itunes:author'] = ['Livio Acerbo'];
  channel['itunes:summary'] = [channel.description ? channel.description[0] : ''];
  channel['itunes:explicit'] = ['no'];
  channel['itunes:owner'] = [{
    'itunes:name': ['Livio Acerbo'],
    'itunes:email': ['livioacerbo@mac.com']
  }];

  // ⚠️ Do NOT add or override <itunes:image>, let SoundCloud’s image stay intact

  // Add iTunes:explicit tag to each episode
  for (const item of channel.item) {
    item['itunes:explicit'] = ['no'];
  }

  const xml = builder.buildObject(result);
  fs.writeFileSync('feed.xml', xml);
  console.log('✅ Apple-compatible feed saved as feed.xml');
}

main().catch(console.error);
