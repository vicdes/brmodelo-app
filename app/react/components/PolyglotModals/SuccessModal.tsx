import React from "react";
import { useTranslation } from "react-i18next";
import Dialog from "../Dialog";

export enum Type {
	workload = "workload",
	nfr = "nfr",
}

interface SuccessModalProps {
	type: Type
}

const SuccessModal: React.FC<SuccessModalProps> = ({ type }) => {
	const { t } = useTranslation(["common"]);

	const handleOpenChange = (nextOpen: boolean) => {
		if (nextOpen) return;
	};
	return (
		<Dialog
			open={true}
			onOpenChange={handleOpenChange}
			title={
				type === Type.workload
					? t("Workload added successfully!")
					: t("Non-functional Requirement added successfully!")
			}
			closeOnOverlayClick
			closeOnEscape
			contentStyle={{ backgroundColor: "white" }}
			titleStyle={{
				fontSize: "1.5em",
				fontWeight: "bold",
				marginLeft: "12px",
				padding: "8px",
			}}
		>
			<button
				className="br-button"
				type="submit"
				onClick={() => handleOpenChange}
				style={{
					backgroundColor: "#009980",
					border: "none",
					borderRadius: "8px",
					color: "white",
					fontSize: "16px",
					padding: "12px",
				}}
			>
				{t("Confirm")}
			</button>
		</Dialog>
	);
};

export default SuccessModal;
