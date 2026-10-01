'use client';
import { useEffect, useRef } from 'react';
import * as AsciinemaPlayer from 'asciinema-player';
import 'asciinema-player/dist/bundle/asciinema-player.css';

export default function Asciinema({
  src,
  options = {},
}: {
  src: string;
  options?: AsciinemaPlayer.AsciinemaPlayerOptions;
}) {
  const containerRef = useRef(null);
  const isRenderedRef = useRef(false);

  useEffect(() => {
    if (containerRef.current && !isRenderedRef.current) {
      AsciinemaPlayer.create(src, containerRef.current, {
        idleTimeLimit: 2,
        preload: true,
        fit: false,
        terminalFontSize: '12px',
        rows: 36,
        ...options,
      });
      isRenderedRef.current = true;
    }
  }, [src, options]);

  return <div ref={containerRef} />;
}

/*
npx create-next-app@latest my-app --ts --app --src-dir
cd my-app
npx vovk-cli@latest init
bat vovk.config.js
npx vovk new segment
bat src/app/api/\[\[...vovk\]\]/route.ts
npx vovk new controller service user
bat src/app/api/\[\[...vovk\]\]/route.ts
bat src/modules/user/UserController.ts
bat src/modules/user/UserService.ts
npm run dev &
curl http://localhost:3000/api/users/12345

ctrl+d
*/
