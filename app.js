// const RoonApi
import RoonApi from 'node-roon-api';
import RoonApiSettings from 'node-roon-api-settings';
import RoonApiStatus from 'node-roon-api-status';
import RoonApiBrowse from 'node-roon-api-browse';
import RoonApiTransport from 'node-roon-api-transport';

class SpotifyExtension {
  onPaired = (_core) => {
    this.core = _core;
    const transport = this.core.services.RoonApiTransport;
    transport.subscribe_zones((cmd, data) => {
      // console.log(this.core.core_id,
      //   this.core.display_name,
      //   this.core.display_version,
      //   '-',
      //   cmd,
      //   JSON.stringify(data, null, '  '));
      if (data.zones_changed) console.log(data, data.zones_changed[0].now_playing);
    });
  };

  setup() {
    const roon = new RoonApi({
      extension_id: 'co.uk.perfect-imperfection.roon',
      display_name: 'We Want Spotify',
      display_version: '0.0.1',
      publisher: 'Michał Domarus',
      email: 'michal@domar.us',
      website: 'http://perfect-imperfection.co.uk',
      core_paired: this.onPaired,
      core_unpaired: () => { this.core = undefined; },
    });

    const makelayout = null;

    let mySettings = {};

    const svcSettings = new RoonApiSettings(roon, {
      get_settings(cb) {
        cb(makelayout(mySettings));
      },
      save_settings(req, isdryrun, settings) {
        const l = makelayout(settings.values);
        req.send_complete(l.has_error ? 'NotValid' : 'Success', {
          settings: l,
        });

        if (!isdryrun && !l.has_error) {
          mySettings = l.values;
          svcSettings.update_settings(l);
          roon.save_config('settings', mySettings);
        }
      },
    });

    this.svcStatus = new RoonApiStatus(roon);


    roon.init_services({
      required_services: [RoonApiTransport, RoonApiBrowse],
      provided_services: [this.svcStatus],
    });

    // const config = roon.load_config('settings') || {
    //   configValue1: true,
    // };
    // roon.save_config('settings', config);

    roon.start_discovery();
  }
}

const roon = new SpotifyExtension();
roon.setup();
