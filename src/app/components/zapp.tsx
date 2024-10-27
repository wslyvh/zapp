"use client";

import { connect, Zapp } from "@parcnet-js/app-connector";
import { useEffect, useRef, useState } from "react";
import * as p from "@parcnet-js/podspec";
import { POD } from "@pcd/pod";

const zapp: Zapp = {
  name: "Devcon Tickets",
  permissions: {
    READ_PUBLIC_IDENTIFIERS: {},
    REQUEST_PROOF: { collections: ["Devcon SEA"] },
    READ_POD: { collections: ["Devcon SEA"] },
  },
};

export function ZappConnect() {
  const ref = useRef<HTMLDivElement>(null);
  const [pods, setPods] = useState<any[]>([]);

  async function ConnectZupass() {
    const zupass = await connect(
      zapp,
      ref.current as HTMLElement,
      "https://zupass.org"
    );
    const key = await zupass.identity.getPublicKey();

    const query = p.pod({
      entries: {
        eventId: {
          type: "string",
          isMemberOf: [
            { type: "string", value: "5074edf5-f079-4099-b036-22223c0c6995" },
          ],
        },
      },
    });

    const pods = await zupass.pod.collection("Devcon SEA").query(query);
    setPods(pods);
  }

  return (
    <div>
      <div ref={ref}></div>
      <p>Connect and fetch PODs</p>
      <button onClick={ConnectZupass}>Connect</button>

      <ul>
        {pods.map((pod, index) => {
          const ticketPod = POD.load(
            pod.entries,
            pod.signature,
            pod.signerPublicKey
          );
          const isValid = ticketPod.verifySignature()
          console.log("POD", pod.signature, isValid);
          
          return (
            <li key={index}>
              {pod.signature} ({isValid.toString()})
            </li>
          )})}
      </ul>
    </div>
  );
}
