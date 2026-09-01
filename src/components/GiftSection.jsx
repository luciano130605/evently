import { Copy02Icon, CopyCheck, CopyCheckIcon, CopyIcon, GiftIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import {
    Copy,
    Gift,
    Check
} from "lucide-react";

import { useState } from "react";

export default function GiftSection({
    alias,
    cbu,
    text
}) {

    const [copied, setCopied] =
        useState("");

    const copy = async (
        value,
        type
    ) => {

        try {

            await navigator.clipboard.writeText(
                value
            );

            setCopied(type);

            setTimeout(
                () => setCopied(""),
                1800
            );

        } catch {
            // fallback silencioso
        }
    };

    return (
        <section className="gift-section">


            <span className="section-kicker">
                SI QUERÉS HACERME UN REGALO
            </span>

            <h2>
                Tu presencia es
                <br />
                el mejor regalo.
            </h2>

            <p>
                {text}
            </p>

            <div className="gift-data">

                {alias && (

                    <div className="gift-row">

                        <div>

                            <span>
                                ALIAS
                            </span>

                            <strong>
                                {alias}
                            </strong>

                        </div>

                        <button
                            type="button"
                            onClick={() =>
                                copy(
                                    alias,
                                    "alias"
                                )
                            }
                        >

                            {copied === "alias"
                                ? <HugeiconsIcon icon={CopyCheckIcon} size={16} />
                                : <HugeiconsIcon icon={CopyIcon} size={16} />
                            }

                            {copied === "alias"
                                ? "Copiado"
                                : "Copiar"
                            }

                        </button>

                    </div>

                )}

                {cbu && (

                    <div className="gift-row">

                        <div>

                            <span>
                                CBU
                            </span>

                            <strong>
                                {cbu}
                            </strong>

                        </div>

                        <button
                            type="button"
                            onClick={() =>
                                copy(
                                    cbu,
                                    "cbu"
                                )
                            }
                        >

                            {copied === "cbu"
                                ? <HugeiconsIcon icon={CopyCheckIcon} size={16} />
                                : <HugeiconsIcon icon={CopyIcon} size={16} />
                            }

                            {copied === "cbu"
                                ? "Copiado"
                                : "Copiar"
                            }

                        </button>

                    </div>

                )}

            </div>

        </section>
    );
}
